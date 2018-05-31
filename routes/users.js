//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var jwt = require('jsonwebtoken');
var DButilsAzure = require('./../DButils');
var PriorityQueue = require('priorityqueuejs')


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

//TODO - FIX
router.post('/DeletePOI', function (req, res) {
    var pointOfInterest = req.body.pointOfInterest;
    var userName = req.decoded.userName;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            var deletePOIFromUser = `DELETE [User Favorite POI] OUTPUT DELETED.* FROM [User Favorite POI] WHERE Username='${userName}' AND POI_id ='${pointOfInterest}';`;
            DButilsAzure.execQuery(deletePOIFromUser).then(function (ret2) {
                if (ret2.length > 0)
                    res.json("POI has removed from favorites successfully.");
                else
                    res.json("No such POI exists at your favorites.")
            });
        }
        else{
            res.json("No such POI exists.");
        }
    });
});


router.post('/AddPOI', function (req, res) {
    var pointOfInterest = req.body.pointOfInterest;
    var userName = req.decoded.userName;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            var addPOIToUser = `INSERT INTO [User Favorite POI] VALUES ('${userName}','${pointOfInterest}',NULL);`
            DButilsAzure.execQuery(addPOIToUser)
                .catch(function () {
                    res.json("You already added the POI to your favorites.")
                }).then(function () {
                var getUserFavorites = `SELECT LastFavorite1,LastFavorite2 FROM [User] WHERE Username='${userName}';`;
                return DButilsAzure.execQuery(getUserFavorites);
            }).then(function (favorites) {
                var lastFavorite1;
                var lastFavorite2;
                if (favorites[0].LastFavorite1 == null) {
                    lastFavorite1 = pointOfInterest;
                }
                else {
                    lastFavorite1 = pointOfInterest;
                    lastFavorite2 = favorites[0].LastFavorite1;
                }
                var updatePOIReviews = `UPDATE [User] SET LastFavorite1='${lastFavorite1}',LastFavorite2='${lastFavorite2}' WHERE Username='${userName}';`;
                DButilsAzure.execQuery(updatePOIReviews).then(function () {
                    res.json("POI has been added to favorites successfully.");
                }).catch(function () {
                    //console.log(err);
                });
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
        else{
            res.json("No such POI exists.")
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
        else{
            res.json("No such POI exists.")
        }
    });


});


router.post('/POIByOrder', function (req, res) {
    var userName = req.decoded.userName;
    var getFavorites = `SELECT POI_id FROM [User Favorite POI] WHERE Username='${userName}';`;
    DButilsAzure.execQuery(getFavorites).then(function (dbFavorites) {
        var userFavoriteOrder = JSON.parse(req.body.favorites);
        var POIs_id = [];
        for (var i = 0; i < dbFavorites.length; i += 1) {
            POIs_id.push(dbFavorites[i].POI_id);
        }
        for (var i = 0; i < userFavoriteOrder.length; i += 1) {
            if (POIs_id.includes(userFavoriteOrder[i].POI_id)) {
                var updateDBPriority = `UPDATE [User Favorite POI] SET PriorityIndex='${userFavoriteOrder[i].priority}' WHERE POI_id='${userFavoriteOrder[i].POI_id}';`;
                DButilsAzure.execQuery(updateDBPriority);
            }
        }
        res.json("Operation finished successfully.")
    });
});

router.get('/PopularPOI', function (req, res) {
    var userName = req.decoded.userName;
    var getFavorites = `SELECT * FROM [User Favorite POI] LEFT JOIN [Point Of Interest] ON [User Favorite POI].POI_id=[Point Of Interest].POI_id WHERE Username='${userName}'; `;
    DButilsAzure.execQuery(getFavorites).then(function (favorites) {
        if (favorites.length == 0) {
            res.json("No favorites added.")
        }
        else if (favorites.length < 3) {
            res.json(favorites);
        }
        else {
            var pq = new PriorityQueue(function (a, b) {
                return a.Rank - b.Rank;
            });
            for (var i = 0; i < favorites.length; i += 1)
                pq.enq(favorites[i]);
            res.json({
                PopularPOI1: pq.deq(),
                PopularPOI2: pq.deq()
            });
        }
    });
});


router.get('/2LastFavorites', function (req, res) {
    var userName = req.decoded.userName;
    var twoLastFavoritesAdd = `Select POI_id,Category,Description,Views,Rank,NumberOfRanks,LastReview1,LastReview2 FROM [User] LEFT JOIN [Point Of Interest] ON [User].LastFavorite1=[Point OF Interest].POI_id OR [User].LastFavorite2=[Point OF Interest].POI_id WHERE Username='${userName}';`;
    DButilsAzure.execQuery(twoLastFavoritesAdd).then(function (lastFavorites) {
        if (lastFavorites == 0)
            res.json("No favorites POIs added");
        else {
            res.json(lastFavorites);
        }
    })
})

module.exports = router;

