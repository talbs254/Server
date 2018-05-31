var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./../DButils');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


router.get('/POIs', function (req, res) {
    var checkPOIExists = `SELECT * FROM [Point Of Interest];`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length >= 1)
            res.json(ret)

        else
            res.json("There are no POIs")
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
        else res.json("There is no such a POI")
    });
});

router.get('/Description/:id', function (req, res) {
    let pointOfInterest = req.params.id;
    var checkPOIExists = `SELECT Description FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            let description = ret[0].Description;
            res.json(description);
        }
        else res.json("There is no such a POI")
    });
});

router.get('/Views/:id', function (req, res) {
    let pointOfInterest = req.params.id;
    var checkPOIExists = `SELECT Views FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            let views = ret[0].Views;
            if (views!=null)
                res.json(views);
        }
        else res.json("There is no such a POI")
    });
});


router.get('/2LastReviews/:id', function (req, res) {
    let pointOfInterest = req.params.id;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            if ((!(ret[0].LastReview1 == null)) && (!(ret[0].LastReview2 == null))) {
                let rev1 = ret[0].LastReview1;
                let rev2 = ret[0].LastReview2;

                res.json({
                    Review1: rev1,
                    Review2: rev2
                });
            }
            else if ((!(ret[0].LastReview1 == null)) && ((ret[0].LastReview2 == null))) {
                let rev1 = ret[0].LastReview1;
                res.json({
                    Review1: rev1
                });
            }
            else
                res.json("There are no Reviews to this POI")
        }
        else res.json("There is no such a POI")
    });
});


router.get('/POI/:id', function (req, res) {
    let pointOfInterest = req.params.id;
    var checkPOIExists = `SELECT * FROM [Point Of Interest] WHERE POI_id='${pointOfInterest}';`;
    DButilsAzure.execQuery(checkPOIExists).then(function (ret) {
        if (ret.length == 1) {
            var updatePOIViews = `UPDATE [Point of Interest] SET Views='${ret[0].Views +1}';`;
            DButilsAzure.execQuery(updatePOIViews)
            res.json(ret)
        }
        else res.json("There is no such a POI")
    });
});

router.get('/Categories', function (req, res) {
    var getAllCategories = `SELECT Category FROM [Category];`;
    DButilsAzure.execQuery(getAllCategories).then(function (ret) {
        if (ret.length < 1) {
            res.json("There are no categories")
        }
        else
            res.json(ret);

    });
});


module.exports = router;
