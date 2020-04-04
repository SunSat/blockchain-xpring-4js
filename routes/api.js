var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");
var Wallet = require("../models/wallet");
var xspring = require("./xspring");
const querystring = require('querystring');

router.post('/signup', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

router.post('/signin', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), config.secret, {
            expiresIn: 604800 // 1 week
          });
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

router.get('/signout', passport.authenticate('jwt', { session: false}), function(req, res) {
  req.logout();
  res.json({success: true, msg: 'Sign out successfully.'});
});

router.post('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);
    var newBook = new Book({
      isbn: req.body.isbn,
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher
    });

    newBook.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Save book failed.'});
      }
      res.json({success: true, msg: 'Successful created new book.'});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    Book.find(function (err, books) {
      if (err) return next(err);
      res.json(books);
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/user/generate/wallet', passport.authenticate('jwt', { session: false}), function(req, res) {
  console.log("-----------------generate/Wallet----------Started----------");
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);
    let walletReq = {
      username: req.body.username,
      passpharse: req.body.passpharse,
    };
    let walletDetails = xspring.generateWallet(walletReq);

    let wallet = new Wallet({
      userName : req.body.username,
      passpharse: req.body.passpharse,
      publicKey: walletDetails.publicKey,
      privateKey: walletDetails.privateKey,
      classicAddress: walletDetails.address.classicAddress,
      tag : walletDetails.address.tag,
      isTest: walletDetails.address.test,
      seed: walletDetails.seed,
      xAddress: walletDetails.xAddress
    });

    console.log("The wallet scheme going to save is : ", wallet);
    wallet.save(function(err){
      if(err) {
        console.log("The Error message is : ", err);
      }
    });
    res.json({success: true, msg: 'Wallet Created Successfully.', walletDetails});
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/user/wallet/:username',passport.authenticate('jwt', { session: false}), function(req, res) {
  console.info("----------------/user/address-----------started--------");
  var token = getToken(req.headers);
  if (token) {
    console.log("The username parameter is : ", req.params.username);
    Wallet.findOne({
      userName: req.params.username
    }, function(err, wallet){
      if(err) {
        res.status(403).send({success:false,msg:'There is no such address available'});
      }
      console.log("The final wallet details are : " , wallet);
      res.json({success: true, wallet:wallet});
    }); 
  }
});

router.get('/user/balance/account/:address',passport.authenticate('jwt', { session: false}), function(req, res) {
  console.info("----------------/user/address-----------started--------");
  let token = getToken(req.headers);
  if (token) {
    let promiseObj = xspring.getBalance(req.params.address);
    promiseObj.then((balance) => {
        res.json({success:true, balance : balance});
    }).catch((err) => {
      let errRes = {
        genericError : 'error while fetching the balance details',
        reqAddress: req.params.address,
        errorMsg : err.data.error_message,
        errorCode: err.data.error_code,
      };
      res.status = 404;
      res.json(errRes);
    });
  }
});

router.get('/user/balance/user/:username',passport.authenticate('jwt', { session: false}), function(req, res) {
  console.info("----------------/user/address-----------started--------");
  let token = getToken(req.headers);
  if (token) {

    console.log("The username parameter is : ", req.params.username);
    let dbPromiseObj = Wallet.findOne({
      userName: req.params.username
    }, function(err, wallet){
      if(err) {
        res.status(403).send({success:false,msg:'There is no such address available'});
      }
      let promiseObj = xspring.getBalance(wallet.classicAddress);
      promiseObj.then((balance) => {
        console.log("The Successful response of the object is : ", balance);
        res.json({success:true, balance : balance});
      }).catch((err) => {
        let errRes = {
          genericError : 'error while fetching the balance details',
          reqAddress: wallet.classicAddress,
          errorMsg : err.data.error_message,
          errorCode: err.data.error_code,
        };
        res.json(errRes);
      });
    });
  }
});

router.post('/user/transfer',passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    let transferReqObj = {
      fromAddress : req.body.fromAddress,
      toAddress : req.body.toAddress,
      amount: 2
    };

    let balance;
    let balancePromise = xspring.getBalance(transferReqObj);
    balancePromise.then((balance) => {
      res.json({success:true, balance : balance});
    });
  }
});

getToken = function (headers) {
  console.log(headers);
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
