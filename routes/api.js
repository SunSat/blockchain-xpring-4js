
var passport = require('passport');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var xspring = require("./xspring");

router.post('/wallet', function(req, res) {
  console.log("-----------------generate/Wallet----------Started----------");
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
    setTimeout(()=> {

    },5000);
    res.json(response);
  });

router.get('/account/balance/:address', function (req,res) {
  console.info("----------------/user/address-----------started--------");
    let promiseObj = xspring.getBalance(req.params.address);
    promiseObj.then((balance) => {
      balance.success = true;
      res.json(balance);
    }).catch((err) => {
      let errRes = {
        genericError : 'error while fetching the balance details',
        reqAddress: req.params.address,
      };
      res.status = 404;
      res.json(errRes);
    });
  });

router.post('/account/transfer', function(req, res) {

  console.log("The full body is : ", req.body);
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
      console.log('oh my god error',err);
      res.json(err);
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

router.post('/v1/accounts/payment/prepare',function (req,res) {
  console.log(req.body);

  xspring.preparePayment(req.body).then(result => {
    return res.json(result);
  }).catch(err => {
    return res.json({status:'error while pareparing for transaction.'});
  })

})

module.exports = router;
