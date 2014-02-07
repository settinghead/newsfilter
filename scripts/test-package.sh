#Usage: test-package.sh [package name]

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

sh $DIR/start_mongodb_for_tests.sh

PACKAGE_DIRS=$DIR/../app/packages MONGO_URL=mongodb://localhost:28018/as1test mrt test-packages ../app/packages/$1