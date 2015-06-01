# Wake Up Call #

## A tool to asynchronusly delay tasks to a point in the future you specify. ##

## Dependencies ##
* Nodejs
* Redis

## Daemon ##
A Ubuntu specific daemon can be installed via npm run install-daemon. It can then be controlled via upstart under the name `wake-up-call`.


# Install
```
sudo apt-get install python-software-properties
sudo add-apt-repository ppa:chris-lea/redis-server
sudo apt-get update
sudo apt-get install redis-server

sudo npm install -g git+https://dev.izeni.net/kcole/wake-up-call.git
cd /usr/lib/node_modules/wake-up-call
npm run install-daemon

sudo start wake-up-call
```
