var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./../DButils');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


router.get('/Rank/:id', function (req, res) {
    let pointOfInterest = req.params.id;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            let ranking = ret[0].Rank;
            res.json(ranking);
        }
    });
});

router.get('/Rank/:id', function (req, res) {
    let pointOfInterest = req.params.id;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            let ranking = ret[0].Rank;
            res.json(ranking);
        }
    });
});

module.exports = router;
