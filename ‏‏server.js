//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var DButilsAzure = require('./DButils');

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
/*
poi_id = "Falafel Nessya";
category = "Restaurant" ;
url = "https://media-cdn.tripadvisor.com/media/photo-s/09/d0/7a/75/falafel-nessya.jpg";
description="Drinks, Lunch, Dinner, Brunch, Accepts Credit Cards, Buffet, Delivery, Digital Payments, Free Wifi, Outdoor Seating, Reservations, Seating, Takeout, Wheelchair Accessible.";
var addPOI = `INSERT INTO [Point Of Interest] (POI_id, Category, ImageURL, Description) VALUES ('${poi_id}', '${category}', '${url}', '${description}');`;
DButilsAzure.execQuery(addPOI)


poi_id = "Fundadores Park";
category = "Attractions" ;
url = "https://media-cdn.tripadvisor.com/media/photo-s/12/06/62/60/portal-maya.jpg";
description="Seaside park with sculptures, a kids' playground & traditional Mayan dance performances.";




query = `DELETE FROM [User Favorite POI];`;
DButilsAzure.execQuery(query);
query = `DELETE FROM [POI Rank];`;
DButilsAzure.execQuery(query);
query = `DELETE FROM [POI Review];`;
DButilsAzure.execQuery(query);
query = `DELETE FROM [User Category];`;
DButilsAzure.execQuery(query);
query = `DELETE FROM [User];`;
DButilsAzure.execQuery(query);




*/

query =  `UPDATE [Point Of Interest] SET LastReview1='default', LastReview2='default'`;
DButilsAzure.execQuery(query);



