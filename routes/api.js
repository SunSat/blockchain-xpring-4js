
var passport = require('passport');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var xspring = require("./xspring");

router.post('/wallet', function(req, res) {
  console.log("-----------------generate/Wallet----------Started----------");
  var token = true;//getToken(req.headers);
  if (token) {
    let walletReq = {
      passpharse: req.body.passpharse,
    };
    let walletDetails = xspring.generateWallet(walletReq);

    let response = {
      success: true,
      msg: 'Wallet Created Successfully.',
      passpharse: req.body.passpharse,
      publicKey: walletDetails.publicKey,
      privateKey: walletDetails.privateKey,
      classicAddress: walletDetails.address.classicAddress,
      tag : walletDetails.address.tag,
      isTest: true,
      seed: walletDetails.seed,
      xAddress: walletDetails.xAddress

    };
    console.log("The wallet scheme going to save is : ", response);
    res.json(response);
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/account/balance/:address', function (req,res) {
  console.info("----------------/user/address-----------started--------");
  let token = true;//getToken(req.headers);
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

router.post('/account/transfer', function(req, res) {

    let transferReqObject = {
      fromAddress: req.body.fromAddress,
      amount:req.body.amount,
      toAddress:req.body.toAddress,
      currency: req.body.currency,
      seed: req.body.seed
    };
    xspring.sendMoney(transferReqObject).then((result) => {
      res.json(result);
    }).catch((err)=> {
      console.log('oh my god error');
      res.json('error');
    });
});

router.get('/transaction/:transactionId', function(req, res) {
    console.log("The transaction id is : ", req.params.transactionId);
    xspring.getTransaction(req.params.transactionId).then((result) => {
      res.json(result);
    }).catch(err => {
      res.json(err);
    });
});

module.exports = router;
