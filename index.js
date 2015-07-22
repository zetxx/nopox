'use strict';
var util = require('util');
var through = require('through2');
var net = require('net');
var destinations = [];

util.inherits(RemoteConnect, net.connect);

function RemoteConnect(opts, onConnect){
    return net.connect.call(this, opts, this.onConnect(onConnect));
}

RemoteConnect.prototype.onConnect = function onConnect(cb) {
    return function(){
        console.log('remotely connected');
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

function ping(propId, pong){
    var prop = destinations[propId];
    console.log('ping ' + prop.prop.remoteHost + '@' + prop.prop.remotePort + '>' + prop.prop.localPort);
    net
        .connect({"host":prop.prop.remoteHost,"port":prop.prop.remotePort}, function(){
            console.log('pong OK '  + prop.prop.remoteHost + '@' + prop.prop.remotePort + '>' + prop.prop.localPort);
            this.end();
            destinations[propId].connectRetries = 0;
            pong(propId);
        })
        .on('error', function(err){
            console.log(err);
            if(err.syscall === 'connect' && (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED')) {
                console.log('pong ' + err.code + ' '  + prop.prop.remoteHost + '@' + prop.prop.remotePort + '>' + prop.prop.localPort);
                ++destinations[propId].connectRetries;
                this.end();
                setTimeout(function(){
                    ping(propId, pong);
                }, prop.prop.connRetryTimeout || 30000);
            }
        });
}

function stats(){
    net
        .createServer(function(c) {
            var alive = 0;
            var aliveStr = [];
            var deadStr = [];
            destinations.map(function(val){
                alive += val.connected;
                if (val.connected) {
                    aliveStr.push(val.prop.remoteHost+'@'+val.prop.remotePort);
                } else {
                    deadStr.push(val.prop.remoteHost+'@'+val.prop.remotePort+'(rtr:'+val.connectRetries+')');
                }
            });
            c.on('error', function(err){
                console.log(err);
            });

            c.write('<H1>NOPOX STAT</H1>');
            c.write('<ul>');
            c.write('<li>Total Connections<ul><li>'+destinations.length+'</li></ul></li>');
            c.write('<li>Live: <ul><li>'+alive+'<ul><li>'+aliveStr.join(';')+'</li></ul></li></ul></li>');
            c.write('<li>Dead<ul><li>'+(destinations.length-alive)+'<ul><li>'+deadStr.join(';')+'</li></ul></li></ul></li>');
            c.write('</ul>');
            c.write('<hr/>');
            c.write('<H2>Per connection</H2>');
            c.write('<ul>');
            destinations.forEach(function(v){
                c.write('<li>localhost: ' + v.prop.localPort + ' &#187; ' + v.prop.remoteHost + ':' + v.prop.remotePort + '<ul><li>connected: '+v.connected+'</li><li>clients connected: '+v.totalClientConnections+'</li></ul></li>');
            });
            c.write('</ul>');
            c.end();
            c.destroy();
        })
        .listen(65001, function() {
            console.log('stats started');
        });
}

function pongOk(id){
    var prop = destinations[id].prop;
	if(!destinations[id].connected) {
		var server = net
			.createServer(function(client) {
				console.log('client connected');
				client.on('error', function(err){
					console.log(err);
				});
				destinations[id].totalClientConnections = destinations[id].totalClientConnections+1;
				var RemoteConnection = new RemoteConnect({"host":prop.remoteHost,"port":prop.remotePort, "id": id}, function(){
					client
						.pipe(before(prop.beforeOut))
						//do log
						.pipe(logger('out', prop.logger))
						//write to remote
						.pipe(RemoteConnection)
						.pipe(before(prop.beforeIn))
						//do log
						.pipe(logger('in', prop.logger))
						//return to client
						.pipe(client);
				});
				RemoteConnection.on('error', function(err){
					console.log('Dissconectiong client because of an error: ');
					console.dir(err);
					client.end();
					client.destroy();
					if(server) {
						server.close(function(){
							console.log('server disconnected due to an error');
							destinations[id].connected = destinations[id].connectRetries = 0;
							setTimeout(function(){
								ping(id, pongOk);
							}, destinations[id].prop.connRetryTimeout || 30000);
							
						});
						server = undefined;
					}
				});
			})
			.listen(prop.localPort, function() {
				++destinations[id].connected;
				console.log('server bound @ %s', prop.localPort);
			});
	}
}

function proxy(_prop) {
    var _id = destinations.push({id: -1, prop: _prop, connectRetries:0, connected: 0, totalClientConnections: 0});
    destinations[_id-1].id = _id-1;
    ping(destinations[_id-1].id, pongOk);
}
stats();
module.exports = proxy;
