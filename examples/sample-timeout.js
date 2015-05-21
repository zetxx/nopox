var nopox = require('../index.js');

var config = {
    "remoteHost":'example.com',
    "remotePort":'80',
    "localPort":8124,
    "logger":function(data){console.log(data.toString());},
    "beforeOut":function(data, cb){
        console.log('before out, timeouts 1.5 sec');
        setTimeout(function(){
            cb(data);
        }, 1500);
    },
    "beforeIn":function(data, cb){
        console.log('before in, timeouts 5.5 sec');
        setTimeout(function(){
            cb(data);
        }, 5500);
    }
};
var proxy = nopox(config);