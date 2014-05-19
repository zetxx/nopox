var nopox = require('lib/main.js');

var Nopox = nopox.create('localhost',80,8384);
Nopox.listen();
Nopox.on('request',function(data){
  var _str = data.toString();
  _str=_str.replace(/Host\:[^\n\r]+/ig,'Host: kalin');
  return new Buffer(_str);
});

Nopox.on('response',function(data,done){
    done(data);
});
