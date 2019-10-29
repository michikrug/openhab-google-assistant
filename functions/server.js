'use strict';
let express = require('express');
let bodyParser = require('body-parser');

const assistent = require('./index.js');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

app.post('/', function (req, res) {
    console.log(req);
    assistent.openhabGoogleAssistant(req,res);
});

// [START server]
// Start the server
let server = app.listen(process.env.PORT || 8092, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
});
// [END server]

module.exports = app;