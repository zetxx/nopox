A proxy like app for nodejs.

It is written for testing purpose only, for simple req response, as transparent proxy

example  

```javascript
var config = {
  "remoteHost":'*.*.*.*'
	,"remotePort":123
	,"listenPort":123
	,"name":'name'
	,'onReq':function(done,data){
		console.log(data.toString());
		done(data);
	}
	,'onResp':function(done,data){
		console.log(data.toString());
		done(data);
	}
};
var proxy = _nopox(config);
proxy.create();
```
