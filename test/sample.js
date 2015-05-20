var nopox = require('../index.js');

nopox({
    "remoteHost":'example.com',
    "remotePort":'80',
    "localPort":8124,
    "logger":function(data){console.log(data.toString());}
});
nopox({
    "remoteHost":'192.11.11.62',
    "remotePort":'9932',
    "localPort":2212,
    "connRetryTimeout":5000,
    "logger":function(data){console.log(data.toString());}
});