A proxy like app for nodejs.
since 0.0.12 its rewritten from scratch without backward compatibility.

It is written for testing purpose only, for simple req response, as transparent proxy

example

```javascript
var nopox = require('nopox');

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
```
