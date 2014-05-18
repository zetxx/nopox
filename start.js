var net = require('net'),
    util = require('util');

function nopox(remoteHost,remotePort,listenPort){
  this.remoteHost = remoteHost;
  this.remotePort = remotePort;
  this.listenPort = listenPort;
  this.onConnectionEvent = {
    "request":function(data){console.log('req: %s',data.toString());return data;}
    ,"response":function(data){console.log('resp: %s',data.toString());return data;}
  };
  var self = this;

  this.server = net.createServer(function(s){self.onBind(s);});
};

nopox.prototype.onBind = function(servConn){
  var self = this;
  console.log('client conected');

  var dest = net.connect({
    "host":this.remoteHost
    ,"port":this.remotePort
  },function(){self.cOnConnect();});

  dest.on('data',function(data){
    self.cOnData(servConn,data);
  });
  dest.on('end', function(){
    self.cOnEnd(servConn);
  });

  servConn.on('end',function(){
    self.sOnEnd(dest);
  });
  servConn.on('data',function(data){
    self.sOnData(dest,data);
  });
};

nopox.prototype.sOnData = function(dest,data){
  try{
    var res = this.onConnectionEvent.request(data);
    if(!res || res=='')
      throw "Resuest method sould return some data";
    dest.write(res);
  } catch (e){
    util.error(e);
  }
};

nopox.prototype.sOnEnd = function(dest){
  console.log('client disconnected from proxy');
};

nopox.prototype.cOnData = function(servConn,data){
  try{
    var res = this.onConnectionEvent.response(data);
    if(!res || res=='')
      throw "Response method sould return some data";
    servConn.write(res);
  } catch(e){
    util.error(e);
  }
};

nopox.prototype.cOnEnd = function(servConn){
  console.log('disconnected from destination');
  servConn.end();
};

nopox.prototype.cOnConnect = function(){
  console.log('Conection to %s:%s successfully.',this.remoteHost,this.remotePort);
};

nopox.prototype.listen = function(){
  try{
    if(!this.listenPort)
      throw "Listen port should be defined";
    console.log('*******************');
    console.log('Listen on port:', this.listenPort);
    console.log('*******************');
    this.server.listen(this.listenPort);
  } catch (e){
    console.log(e);
  }
};

nopox.prototype.on = function(type,fn){
  switch (type){
      case 'request':
        this.onConnectionEvent[type] = fn;
      break;
      case 'response':
        this.onConnectionEvent[type] = fn;
      break;
  }
};

var Nopox = new nopox('localhost',80,8384);
Nopox.listen();
Nopox.on('request',function(data){
//  new Buffer(data.toString())
  var _str = data.toString();
  _str=_str.replace(/Host\:[^\n\r]+/ig,'Host: kalin');
  return new Buffer(_str);
});
