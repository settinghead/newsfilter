#!/bin/bash
set -e

# IP or URL of the server you want to deploy to
APP_HOST=viral.settinghead.info

# Uncomment this if your host is an EC2 instance
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# You usually don't need to change anything below this line

APP_NAME=newsfilter
ROOT_URL=http://$APP_HOST
PORT=3000
APP_DIR=/var/www/$APP_NAME
METEOR_SETTINGS=`cat $DIR/../settings/production.json`
MONGO_URL=mongodb://localhost:27017/$APP_NAME
SSH_HOST="ubuntu@$APP_HOST" SSH_OPT=""
if [ -d ".meteor/meteorite" ]; then
    METEOR_CMD=mrt
  else
    METEOR_CMD=meteor
fi

case "$1" in
setup )
echo Preparing the server...
echo Get some coffee, this will take a while.
ssh $SSH_OPT $SSH_HOST DEBIAN_FRONTEND=noninteractive 'sudo -E bash -s' <<'ENDSSH'
set -e
apt-get update
apt-get install -y python-software-properties
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get install -y build-essential nodejs mongodb imagemagick libmagick++-dev git graphicsmagick redis-server
npm install -g forever
curl https://install.meteor.com/ | sh
npm install -g meteorite
npm install -g coffee-script
npm install -g mocha
mkdir /home/ubuntu/tmp
chown -R ubuntu:ubuntu /home/ubuntu/tmp
ENDSSH
echo Done. You can now deploy your app.
;;
deploy )
echo Preparing bundle...
cd $DIR
cd ../app
meteor list
mrt install
$METEOR_CMD bundle bundle.tgz &&
scp $SSH_OPT bundle.tgz $SSH_HOST:/tmp/ &&
scp $SSH_OPT ../settings/production.json $SSH_HOST:/tmp/ &&
rm bundle.tgz &&
cd ../
tar -zcvf ./worker.tar.gz ./workers &&
scp $SSH_OPT worker.tar.gz $SSH_HOST:/tmp/ &&
rm worker.tar.gz&&
echo Deploying...
ssh $SSH_OPT $SSH_HOST PORT=$PORT MONGO_URL=$MONGO_URL ROOT_URL=$ROOT_URL APP_DIR=$APP_DIR 'bash -s' <<'ENDSSH'
set -e
if [ ! -d "$APP_DIR" ]; then
sudo mkdir -p $APP_DIR
sudo chown -R ubuntu:ubuntu $APP_DIR
fi
pushd $APP_DIR
forever stopall
rm -rf bundle
tar xfz /tmp/bundle.tgz -C $APP_DIR
tar xfz /tmp/worker.tar.gz -C $APP_DIR
cp /tmp/production.json $APP_DIR/
rm /tmp/bundle.tgz
sudo chown -R ubuntu:ubuntu $APP_DIR
pushd bundle/programs/server/node_modules
rm -rf fibers
npm install fibers@1.0.1
npm update imagemagick-native
npm update kue
npm update imagemagick
popd
export METEOR_SETTINGS=`cat production.json`
forever start bundle/main.js > production.log
popd
pushd $APP_DIR/workers
npm install
NODE_ENV=test mocha feedcrawler/test/
forever start --killSignal SIGTERM app.js > production_workers.log
popd
ENDSSH
last_status=$?
if [[ $last_status != 0 ]]; then
  exit $last_status
else
  echo Your app is deployed and serving on: $ROOT_URL
fi
;;
* )
cat <<'ENDCAT'
./meteor.sh [action]

Available actions:

  setup   - Install a meteor environment on a fresh Ubuntu server
  deploy  - Deploy the app to the server
ENDCAT
;;
esac
