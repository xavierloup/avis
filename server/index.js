var express = require('express');
var request = require('request');
var cfenv = require('cfenv');
var bodyParser = require('body-parser');
var Cloudant = require('cloudant');
var fs = require("fs")
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

var app = express();
app.use(express.static(__dirname + '/../client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.listen(appEnv.port, appEnv.bind, function() {
    console.log("server starting on " + appEnv.url);
})

// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// ROUTES //
// ------------------------------------------------------------------------- //

app.post('/review', function(req, res){
  nlu.analyze({
    'text': req.body.text, // Buffer  or String
    'features': { 'sentiment' : {} }
  }, function(err, response) {
       if (err) {
         console.log('error:', err);
         db.insert( { text : JSON.stringify(req.body.text), creation_date : new Date().getTime() } );
         res.send();
       } else {
         db.insert( { text : JSON.stringify(req.body.text), creation_date : new Date().getTime(), score : response.sentiment.document.score } );
         res.send();
       }
   });
//   db.insert( { text : JSON.stringify(req.body.text), creation_date : new Date().getTime() } );
//   res.send();
});

app.get('/reviews', function(req, res){
  db.list({include_docs:true}, function (err, data) {
    res.send({payload: data.rows});
  });
});

app.get('/review', function(req, res){
  db.get(req.query.id, function (err, data) {
    res.send({payload: data });
  });
});

// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// Find service configuration //
// ------------------------------------------------------------------------- //


var fileName = "./secret-config.json"
var services
if (process.env.VCAP_SERVICES) {
  services = JSON.parse(process.env.VCAP_SERVICES);
} else {
  try {
    services = require(fileName);
  }
  catch (err) {
    services = {}
    console.log("Config file '" + fileName + "' not found", err)
    console.log("see secret-config-sample.json for an example")
  }
}

// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// CLOUDANT DB //
// ------------------------------------------------------------------------- //

// To Store URL of Cloudant VCAP Services as found under environment variables on from App Overview page
var cloudant_url;
if (services.cloudantNoSQLDB) { //Check if cloudantNoSQLDB service is bound to your project
  cloudant_url = services.cloudantNoSQLDB[0].credentials.url;  //Get URL and other paramters
} else {
  console.error("No Cloudant DB found");
}

// Connect using cloudant npm and URL obtained from previous step
var cloudant = Cloudant({url: cloudant_url});
// Edit this variable value to change name of database.
var dbname = 'review';
var db;

// Create database
cloudant.db.create(dbname, function(err, data) {
  	if (err) //If database already exists
	    console.log("Database already exists."); //NOTE: A Database can be created through the GUI interface as well
  	else
	    console.log("Created database.");

  	// Use the database for further operations like create view, update doc., read doc., delete doc. etc, by assigning dbname to db.
  	db = cloudant.db.use(dbname);
});

// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// Natural Language Understanding Service //
// ------------------------------------------------------------------------- //
var nlu_username;
var nlu_password;
var nlu;
if (services["natural-language-understanding"]) { //Check if cloudantNoSQLDB service is bound to your project
   nlu = new NaturalLanguageUnderstandingV1({
    username: services["natural-language-understanding"][0].credentials.username,
    password: services["natural-language-understanding"][0].credentials.password,
    version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
  });
} else {
  console.error("No NaturalLanguageUnderstanding service found");
}
