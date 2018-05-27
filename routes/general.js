var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./../DButils');
var jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



router.post('/register', function(req,res){

    let userName = req.body.userName;
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let city = req.body.city;
    let country = req.body.country;
    let email = req.body.email;
    let verifier1 = req.body.verifier1;
    let verifier2 = req.body.verifier2;

    let categories = req.body.category;


    let checkIfUserAlreadyExists = `SELECT * FROM [User] WHERE Username='${userName}';`;
    DButilsAzure.execQuery(checkIfUserAlreadyExists).then(function(ret){
        if(ret.length > 0){
            res.json("Username is already exists")
        }
        else{
            let addUser = `INSERT INTO [User] VALUES ('${userName}','${password}','${firstName}','${lastName}','${city}','${country}','${email}','${verifier1}','${verifier2}')`;
            DButilsAzure.execQuery(addUser).then(function(){
                for(var i=0 ; i<categories.length ;i+=1){
                    let addUserCategory = `INSERT INTO [User Category] VALUES('${userName}','${categories[i]}')`;
                    DButilsAzure.execQuery(addUserCategory);
                }
                res.json("Register finished successfully");

            });
        }
    }).catch(function(err){
        res.json(err);
    });
});

router.post('/login', function(req,res){
    let userName = req.body.userName;
    let password = req.body.password;

    let query = `SELECT Password FROM [User] WHERE Username='${userName}';`
    DButilsAzure.execQuery(query).then(function (ret) {
        if(password != ret[0].Password){
            res.json({ success:false,
                message: 'Authentication failed. Wrong password.'
            })
        }
        else{
            var payload = {
                userName: userName,
                password: password,
            }

            var token = jwt.sign(payload, 'ihatethiswork',{
                expiresIn: 86400 // expires in 24 hours
            });
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }
    }).catch(function () {
        res.json({ success:false,
            message: 'No such user exists.'
        })
    });
});

router.post('/retrievePassword', function(req,res){
    let userName = req.body.userName;
    let verifier1 = req.body.verifier1;
    let verifier2 = req.body.verifier2;

    let query = `SELECT Verifier1,Verifier2,Password FROM [User] WHERE Username='${userName}';`
    DButilsAzure.execQuery(query).then(function(result) {
        res.send((verifier1 == result[0].Verifier1 &&
            verifier2 == result[0].Verifier2) ? result[0].Password : "Wrong verifiers.");
    });
});

module.exports = router;