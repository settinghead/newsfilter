if [ ! -d "/tmp/ram" ];then
  mkdir -p /tmp/ram
  sudo mount -t tmpfs -o size=1024M tmpfs /tmp/ram/
fi
mongod --smallfiles --noprealloc --nojournal --port 28018 --dbpath /tmp/ram
