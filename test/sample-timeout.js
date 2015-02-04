var nopox = require('../index.js');

var config = {
  "remoteHost":'example.com'
    ,"remotePort":80
    ,"listenPort":9991
    ,"name":'example.com'
    ,'onReq':function(done,data){
        console.log('request');
        console.log('will wait 5 sec. in request on 1 request');
        console.log(data.toString());

        setTimeout(function(){
            console.log('sending request now');
            done(data);
        },6000);
    }
    ,'onResp':function(done,data){
        console.log('response');
        console.log(data.toString());
        setTimeout(function(){
            console.log('sending request now');
            done(data);
        },6000);
    }
};
var proxy = nopox(config);
proxy.create();