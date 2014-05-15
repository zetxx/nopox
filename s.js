var net = require('net');
var connectCounter = 0;


var server = net.createServer(function(c) { //'connection' listener
  connectCounter++;
  console.log(connectCounter+' client/s conected');
  
  var dest = net.connect({"port":80,"host":"www.dir.bg"},function(){
    console.log('connected2dest');
  });
  
  dest.on('data', function(data) {
    c.write(data);
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    console.log(data.toString());
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  });
  dest.on('end', function() {
    console.log('dest disconnected');
    c.end();
  });
  
  c.on('end', function() {
    connectCounter--;
    console.log('client disconnected');
  });
  c.on('data', function(data) {
    dest.write(data);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log(data.toString());
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  });
//  c.write('hello\r\n');
//  c.pipe(c);
});
server.listen(8124, function() { //'listening' listener
  console.log('server bound');
});