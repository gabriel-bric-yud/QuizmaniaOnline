var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || '4000';
app.set('port', port);


app.use(express.static('public'));

server.listen(port, () => {
  console.log('listening on port: '+ port);
})
