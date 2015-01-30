var net = require('net');

function _remote(host, port, localConnection, onReq, onResp){
	onReq = onReq || function(done, data){done(data)};
	onResp = onResp || function(done, data){done(data)};

	var remote = net.connect({'host':host,'port': port},function() {
			console.log('connected to server: %s:%s', host, port);
			localConnection.on('end', function() {
				console.log('local client disconnected: %s', port);
				remote.end();
			});
			localConnection.on('data', function(data) {
				console.log('local client requested: %s', port);
				var fn = function(_data){remote.write(_data);};
				onReq(fn, data);
			});
		}
	);
	remote.on('error', function (e) {
		console.log('error connecting to server: %s:%s', host, port);
	});
	remote.on('end', function (e) {
		console.log('end connection to server: %s:%s', host, port);
	});
	remote.on('data', function (data) {
		console.log('remote data received: %s:%s', host, port);
		var fn = function(_data){localConnection.write(_data);};
		onResp(fn, data);
	});
};

function _local(port, clientConnected, host){
	var server = net.createServer(function(c) {
		console.log('new client connection on port: %s', port);
		c.on('error', function() {
			console.log('client connection error %s', port);
		});
		clientConnected(c);
	});
	
	server.listen(port, function() {
		console.log('waiting for connection on %s:%s', host || 'localhost', port);
	});
};

module.exports = function(settings){
  return {
    "create":function(){
		new _local(settings.listenPort, function(localConnection){
			new _remote(settings.remoteHost, settings.remotePort, localConnection, settings.onReq, settings.onResp);
		});
    }
  };
};
