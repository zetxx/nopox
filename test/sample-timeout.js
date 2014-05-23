var nopox = require('nopox')({"remoteHost":'1.1.1.1',"remotePort":8989,"listenPort":59333});

var Nopox = nopox.create();
Nopox.listen();
Nopox.on('request',function(data){
  var _str = data.toString();
  _str=_str.replace(/Host\:[^\n\r]+/ig,'Host: kalin');
  return new Buffer(_str);
});

Nopox.on('request',function(data,done){
    console.log('request');
    console.log('will wait 5 sec. in request on 1 request');
    console.log(data.toString());
    
    setTimeout(function(){
        console.log('sending request now');
        done(data);
    },6000);
});

Nopox.on('response',function(data,done){
    console.log('response');
    console.log(data.toString());
    setTimeout(function(){
        console.log('sending request now');
        done(data);
    },6000);
});