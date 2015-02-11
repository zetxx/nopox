var net = require('net');
var clientID = 0;

function _remote(settings, host, port, localConnection, onReq, onResp, _clientID){
    onReq = onReq || function(done, data){done(data)};
    onResp = onResp || function(done, data){done(data)};
    this.clientID = _clientID;
    var self = this;

    var remote = net.connect({'host':host,'port': port},function() {
            console.log('connected to server: %s:%s', host, port);
            localConnection.on('end', function() {
                console.log('local client disconnected: %s [CID: %s]', port, _clientID);
                remote.end();
            });
            localConnection.on('data', function(data) {
                console.log('local client requested: %s  [CID: %s]', port, _clientID);
                var fn = function(_data){remote.write(_data);};
                onReq.apply(self, [fn, data]);
            });
            localConnection.on('close-both', function() {
                console.log('destroing both: [CID: %s]', _clientID);
                localConnection.destroy();
                remote.destroy();
            });
        }
    );
    remote.on('error', function (e) {
        if(!settings.endOnError || settings.endOnError === true) {
            console.log('error connecting to server: %s:%s ENDING CONNECTION  [CID: %s]', host, port, _clientID);
            localConnection.emit('close-both');
        } else {
            console.log('error connecting to server: %s:%s  [CID: %s]', host, port, _clientID);
        }
    });
    remote.on('end', function (e) {
        console.log('server: %s:%s disconnected, ending client connection  [CID: %s]', host, port, _clientID);
        localConnection.end();
    });
    remote.on('data', function (data) {
        console.log('remote data received: %s:%s  [CID: %s]', host, port, _clientID);
        var fn = function(_data){localConnection.write(_data);};
        onResp.apply(self, [fn, data]);
    });
};

function _local(port, settings, clientConnected, host){
    var server = net.createServer(function(c) {
        var _clientId = ++clientID;

        console.log('new client connection on port: %s [CID: %s]', port, _clientId);
        c.on('error', function() {
            if(!settings.endOnError || settings.endOnError === true) {
                console.log('client connection error, ENDING! %s [CID: %s]', port, _clientId);
                c.emit('close-both');
            } else {
                console.log('client connection error %s [CID: %s]', port, _clientId);
            }
        });
        clientConnected(c, _clientId);
    });

    server.listen(port, function() {
        console.log('waiting for connection on %s:%s', host || '0.0.0.0', port);
    });
};

module.exports = function(settings){
  return {
    "create":function(){
        new _local(settings.listenPort, settings, function(localConnection, _clientID){
            new _remote(settings, settings.remoteHost, settings.remotePort, localConnection, settings.onReq, settings.onResp, _clientID);
        });
    }
  };
};