const { XRPAmount, XpringClient, Wallet } = require('xpring-js');
const serverApi = require('../config/serverRippleApi').ServerApi;
const remoteURL = "grpc.xpring.tech:80";
//const xpringClient = new XpringClient(remoteURL);
const sha256 = require('sha256');
const rippleKey = require("ripple-keypairs");
const addressCodec = require('ripple-address-codec');


function generateWallet(wallet) {
    let result;
    try {
        const unit8Array = sha256('sundar19sat84');
        const unit8agaArray = sha256(unit8Array, {asBytes: true});
        let options = {
            algorithm : 'ecdsa-secp256k1',
            entropy: unit8agaArray,
            includeClassicAddress: true,
            test: true
        };
        let secrete = rippleKey.generateSeed(options);

        console.log("The secrete seed is : ", secrete);
        let wallet = Wallet.generateWalletFromSeed(secrete);
        let classicAddress = addressCodec.xAddressToClassicAddress(wallet.getAddress());
        result = {
            seed: secrete,
            xAddress: wallet.getAddress(),
            address: classicAddress,
            publicKey: wallet.getPublicKey(),
            privateKey: wallet.getPrivateKey()
        }
    }catch(err) {
        console.error("Error while creting account and error message is : ", err);
    }
    console.log("The final result is : ", result);
    return result;
}

function generateRandomWallet() {
    const result = Wallet.generateRandomWallet ();
    console.log ("Ramdom Wallet Generated Successfully. " + result);
    return result;
}

async function getBalance(address) {
    let balanceArr=[];
    try {
        await serverApi.connect().catch((err) => {
            console.error(err);
            return "error while connecting with sever."
        });

        let balances = await serverApi.getBalances(address);
        await serverApi.disconnect();
        balances.forEach((bal) => {
            let currencyAmt = 0;
            if(bal.currency == 'drop') {
                currencyAmt = bal.value / 1000000;
            } else {
                currencyAmt = bal.value;
            }
            let balance = {
                currency : 'xrp',
                value : currencyAmt
            };
            balanceArr.push(balance);
        });
    } catch(err) {
        await serverApi.disconnect();
        throw err;
    }
    return balanceArr[0];
}

async function sendMoney(fromAddress, toAddress, amount) {
    console.log("The Wallet generated successfully.", wallet);

    let xrpAmount = new XRPAmount();
    xrpAmount.setDrops ('123456789');
    console.log("The Decode of XAddress ", Utils.decodeXAddress(toAddress));
    console.info("1 is Valid Address : ", Utils.isValidAddress(toAddress));
    console.info("2 is Valid Address : ", Utils.isValidClassicAddress(toAddress));
    console.info("3 is Valid Address : ", Utils.isValidXAddress(toAddress));
    console.info("4 is Valid Address : ", toAddress);

    //let result = await xpringClient.send(wallet,xrpAmount,toAddress);
    //console.log("The final transfer result ", result);
    return "";
}

module.exports.generateWallet = generateWallet;
module.exports.generateRandomWallet = generateRandomWallet;
module.exports.getBalance = getBalance;
module.exports.sendMoney = sendMoney;

//getBalance('rJu9mgh7EHEthe8J5CRHnXasikUkghkjWr');