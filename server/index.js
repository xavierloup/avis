var express = require('express');
var multer = require('multer');
var uuid =  require('node-uuid');
var request = require('request');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var ObjectStorage = require('bluemix-object-storage');
var OpenWhisk = require('openwhisk');

var app = express();
var storage = multer.memoryStorage();
var uploadr = multer({storage: storage});

app.use(morgan('dev'));
app.use(express.static(__dirname + '/../client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000);
// app.listen(process.env.PORT, process.env.IP, function(){
//   console.log('[LISTENING] - port:', process.env.PORT, 'ip:', process.env.IP);
// });

app.post('/nodered', function(req, res){
  var o = JSON.parse(req.body.payload);

  console.log('Request to NodeRED:', o);
  request(o, function(e, r, b){
    console.log('Response from NodeRED:', b);
    res.send({error: e, status: r.statusCode, request: o, response: b});
  });
});

app.post('/openwhisk', function(req, res){
  var o = JSON.parse(req.body.payload);

  console.log('Request to OpenWhisk:', o);
  OpenWhisk(o.org, o.space, o.action, process.env.OPENWHISK, o.payload)
  .then(function(r){
    console.log('Response from OpenWhisk:', r);
    res.send(r);
  });
});

// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// ROUTES //
// ------------------------------------------------------------------------- //

app.get('/alerts', function(req, res){
  request({ url: 'https://community-alert-nr.mybluemix.net/alerts', json: true }, function(error, response, body) {
    console.log('error:', error);
    console.log('status code:', response.statusCode);
    res.send({payload: body});
  })
});

app.get('/alert', function(req, res){
  request({ url: 'https://community-alert-nr.mybluemix.net/alert?id=' + req.query.id, json: true }, function(error, response, body) {
    console.log('error:', error);
    console.log('status code:', response.statusCode);
    res.send({payload: body});
  })
});
