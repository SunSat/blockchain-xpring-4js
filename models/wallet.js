var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WalletSchema = new Schema({
  userName : String,
  passpharse: String,
  publicKey: String,
  privateKey: String,
  classicAddress: String,
  tag: String,
  isTest: Boolean,
  xAddress: String,
  seed: String
});

module.exports = mongoose.model('Wallet', WalletSchema);
