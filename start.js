var net = require('net');

function nopox(remoteHost,remotePort,listenPort){
  this.remoteHost = remoteHost;
  this.remotePort = remotePort;
  this.listenPort = listenPort;
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
  dest.write(data);
};

nopox.prototype.sOnEnd = function(dest){
  console.log('client disconnected from proxy');
};

nopox.prototype.cOnData = function(servConn,data){
  servConn.write(data);
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

var Nopox = new nopox('belogradchik.biz',80,8384);
Nopox.listen();
