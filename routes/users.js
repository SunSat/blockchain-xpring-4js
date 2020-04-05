var express = require('express');
var router = express.Router();
var Wallet = require("../models/wallet");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

async function getWalletByUserName(userName) {
  console.log("Entered into getWalletByUserName - userName : ", userName);
  await Wallet.findOne({
    userName: userName
  }, function(err, wallet){
    if(err) {
      throw {
        error : "error while fetching user wallet from database",
        userName : userName
      }
    }
    let walletDetails = {
      classicAddress: wallet.classicAddress,
      userName: wallet.userName,
      xAddress: wallet.xAddress,
      publicKey: wallet.publicKey,
      seed: wallet.seed,
      tag: wallet.tag
    };
    console.log("]]]]]]]]]]]]] = ",walletDetails);
    return walletDetails;
  });
}
module.exports = router;
module.exports.getWalletByUserName = getWalletByUserName;
