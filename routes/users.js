//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var jwt = require('jsonwebtoken');
var DButilsAzure = require('./../DButils');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


router.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, 'ihatethiswork', function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

router.post('/DeletePOI', function (req, res) {
    var pointOfInterest = req.body.pointOfInterest;
    var userName = req.decoded.userName;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            var deletePOIFeomUser = `DELETE FROM [User Favorite POI] WHERE Username='${userName}' AND POI_ID ='${pointOfInterest}';`;
            DButilsAzure.execQuery(deletePOIFeomUser).then(function (ret2) {
                if (ret2.length > 0)
                    res.json("POI has removed from favorites.");
                else
                    res.json("No such POI exists at your favorites.")
            });
        }
    });
});


router.post('/FavoritePOI', function (req, res) {
    var pointOfInterest = req.body.pointOfInterest;
    var userName = req.decoded.userName;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            var addPOIToUser = `INSERT INTO [User Favorite POI] VALUES ('${userName}','${pointOfInterest}',NULL);`
            DButilsAzure.execQuery(addPOIToUser).then(function () {
                res.json("POI has been added to favorites.");
            }).catch(function () {
                res.json("You already added the POI to your favorites.")
            });
        }
        else {
            res.json("No such point of interest exists.")
        }
    });
});

router.post('/RankPOI', function (req, res) {
    var pointOfInterest = req.body.pointOfInterest;
    var rank = parseFloat(req.body.rank);
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    var userName = req.decoded.userName;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length > 0) {
            var insertUserRankTable = `INSERT INTO [POI Rank] VALUES ('${userName}','${pointOfInterest}','${rank}');`;
            DButilsAzure.execQuery(insertUserRankTable).then(function () {
                var poiRank = ret[0].Rank;
                var poiNumOfRanks = ret[0].NumberOfRanks;
                var newRankAverage = (poiRank * poiNumOfRanks + rank) / (poiNumOfRanks + 1);
                var updateRank = `UPDATE [Point of Interest] SET Rank='${newRankAverage}' WHERE POI_id='${pointOfInterest}';`;
                var updateNumOfRanks = `UPDATE [Point of Interest] SET NumberOfRanks='${poiNumOfRanks + 1}' WHERE POI_id='${pointOfInterest}';`;
                DButilsAzure.execQuery(updateRank)
                    .then(DButilsAzure.execQuery(updateNumOfRanks))
                    .then(function () {
                        res.json("Thanks for the ranking!");
                    }).catch(function (err) {
                    res.json(err);
                })
            }).catch(function () {
                res.json("You already rank this POI");
            });
        }
    });
});

router.post('/ReviewPOI', function (req, res) {
    var userName = req.decoded.userName;
    var pointOfInterest = req.body.pointOfInterest;
    var review = req.body.review;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    var date = new Date().toISOString();
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length > 0) {
            var insertUserReviewTable = `INSERT INTO [POI Review] VALUES ('${pointOfInterest}','${userName}','${review}','${date}');`;
            DButilsAzure.execQuery(insertUserReviewTable).then(function () {
                var lastReview1;
                var lastReview2;
                if (ret[0].LastReview1 == '') {
                    lastReview1 = review;
                    lastReview2 = '';
                }
                else if (ret[0].LastReview2 == '') {
                    lastReview1 = ret[0].LastReview1;
                    lastReview2 = review;
                }
                else {
                    lastReview2 = ret[0].LastReview1;
                    lastReview1 = review;
                }
                var updatePOIReviews = `UPDATE [Point of Interest] SET LastReview1='${lastReview1}',LastReview2='${lastReview2}' WHERE POI_id='${pointOfInterest}';`;
                DButilsAzure.execQuery(updatePOIReviews).then(function () {
                    res.json("Thanks for the review!")
                }).catch(function (err) {
                    console.log(err);
                });


            }).catch(function () {
                res.json("You already reviewed this POI")
            });
        }
    });

});

module.exports = router;

