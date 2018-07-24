//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var poi = require('./routes/poi');
var users = require('./routes/users');
var general = require('./routes/general');

app.use('/poi',poi);
app.use('/users',users);
app.use('/',general);





var port = 8080;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});
//-------------------------------------------------------------------------------------------------------------------
