var nopox = require('lib/main.js')({"remoteHost":'localhost',"remotePort":80,"listenPort":8384});

var Nopox = nopox.create();
Nopox.listen();
Nopox.on('request',function(data){
  var _str = data.toString();
  _str=_str.replace(/Host\:[^\n\r]+/ig,'Host: kalin');
  return new Buffer(_str);
});

Nopox.on('response',function(data,done){
    done(data);
});
