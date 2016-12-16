var express = require('express');
var req = require('request');
var cors = require('cors');

var app = express();
app.use(cors());

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
