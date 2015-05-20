A proxy like app for nodejs.

since 0.0.12 its rewritten from scratch without backward compatibility.

It is written for testing purpose only, for simple req response, as transparent proxy

WARNING: port `65001` is for internal use, if you connect to localhost:65001 you will see some statistics

example

```javascript
var nopox = require('nopox');

var config = {
    "remoteHost":'example.com',
    "remotePort":'80',
    "localPort":8124,
    "retryTimeout":5000,//connect retry timeout(ms), defaults to 30000
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
```
