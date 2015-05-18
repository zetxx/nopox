'use strict';
var util = require('util');
var through = require('through2');
var net = require('net');

util.inherits(remoteConnect, net.connect);

function remoteConnect(opts, onConnect){
    return net.connect.call(this, opts, this.onConnect(onConnect));
};

remoteConnect.prototype.onConnect = function onConnect(cb) {
    return function(){
        console.log('remotely connected to %s @ %s');
        cb.apply(this);
    }
};

function logger(type, logCb){
    var _cb = logCb || function(data){
            console.log(data);
        };
    var s = through(function(chunk, enc, callback){
        console.log('loging %s', type);
        _cb(chunk);
        this.push(chunk);
        callback();
    });
    s.once('end',function(data){
        console.log('END %s', type);
        this.push(data || null);
    });
    return s;
}

function before(cb){
    var _before = cb || function(data, cb){
        cb(data);
    };
    return through(function(chunk, enc, callback){
        var s = this;
        _before(chunk, function(chunkTransformed){
            s.push(chunkTransformed);
            callback();
        });
    });
}

function proxy(prop) {
    return net
        .createServer(function(client) {
            console.log('client connected');
            var remoteConnection = new remoteConnect({"host":prop.remoteHost,"port":prop.remotePort}, function(){
                client
                    .pipe(before(prop.beforeOut))
                    //do log
                    .pipe(logger('out', prop.logger))
                    //write to remote
                    .pipe(remoteConnection)
                    .pipe(before(prop.beforeIn))
                    //do log
                    .pipe(logger('in', prop.logger))
                    //return to client
                    .pipe(client);
            });
            remoteConnection.on('error', function(err){
                console.log('Dissconectiong client because of an error: ');
                console.dir(err);
                client.end();
            });
        })
        .listen(prop.localPort, function() {
            console.log('server bound @ %s', prop.localPort);
        });
}

module.exports = proxy;
