var net = require('net'),
    util = require('util');

function nopox(remoteHost,remotePort,listenPort){
  this.remoteHost = remoteHost;
  this.remotePort = remotePort;
  this.listenPort = listenPort;
  this.onConnectionEvent = {
    "request":function(data){console.log('req: %s',data.toString());return data;}
    ,"response":function(data,done){console.log('resp: %s',data.toString());done(data);}
  };
  var self = this;

  try {
    this.server = net.createServer(function(s){self.onBind(s);});
  } catch(e){
    console.log('Error while binding local port.', e);
  }

  this.server.on('error',function(error){
    console.log('"serv" conn error');
    console.log(error);
  });
};

nopox.prototype.onBind = function(servConn){
  var self = this;
  console.log('client conected');

  try {
      var dest = net.connect({
        "host":this.remoteHost
        ,"port":this.remotePort
      },function(){self.cOnConnect();});
  } catch(e) {
    console.log('Error while connecting on remote side.',e);
  }

  dest.on('data',function(data){
    self.cOnData(servConn,data);
  });

  dest.on('end', function(){
    self.cOnEnd(servConn);
  });

  dest.on('error', function(error){
    console.log('"dest" conn error');
    console.log(error);
  });

  servConn.on('end',function(){
    self.sOnEnd(dest);
  });
  servConn.on('data',function(data){
    self.sOnData(dest,data);
  });
};

nopox.prototype.sOnData = function(dest,data){
  this.onConnectionEvent.request(data,function(_data){
    try{
        dest.write(_data);
    } catch (e){
        util.log('Cannot write to "dest" socket');
        util.log(e);
    }
  });
};

nopox.prototype.sOnEnd = function(dest){
  console.log('client disconnected from proxy');
  try{
    dest.end();
  }catch(e){
    console.log('client disconnected from proxy ERROR:',e);
  }
};

nopox.prototype.cOnData = function(servConn,data){
  this.onConnectionEvent.response(data,function(_data){
  try{
    servConn.write(_data);
  } catch(e){
    util.log('Cannot write to "servConn" socket');
    util.log(e);
  }
  });
};

nopox.prototype.cOnEnd = function(servConn){
  console.log('disconnected from destination');
  try {
    servConn.end();
  } catch (e) {
    console.log('client finished, closing server conn: ',e);
  }
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

module.exports = function(settings){
  return {
    "create":function(){
      return (new nopox(settings.remoteHost,settings.remotePort,settings.listenPort));
    }
  };
};