const { Wallet } = require('xpring-js');
const serverApi = require('../config/serverRippleApi').ServerApi;
const sha256 = require('sha256');
const rippleKey = require("ripple-keypairs");
const addressCodec = require('ripple-address-codec');


function generateWallet(walletReq) {
    let result;
    try {
        const unit8Array = sha256(walletReq.passpharse);
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
        };
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

async function sendMoney(transferReqObject) {
    //Step 1 :
    let prepareTx = {
        "TransactionType": "Payment",
        "Account": transferReqObject.fromAddress,
        "Amount": serverApi.xrpToDrops(transferReqObject.amount),
        "Destination": transferReqObject.toAddress
    };

    try {
        await serverApi.connect().catch((err) => {
            console.error(err);
            return "error while connecting with sever. Please retry after some time."
        });
    }catch (e) {
        let response = {
            status : 'error',
            message: 'error while preparing for trnasfer request. ',
            reason: 'invalid address format'
        }
        throw response;
    }
    let transactionPrepared;
    try {
        transactionPrepared = await serverApi.prepareTransaction(prepareTx,{
            // Expire this transaction if it doesn't execute within ~5 minutes:
            "maxLedgerVersionOffset": 75
        });
    } catch (err) {
        let response = {
            status : 'error',
            message: 'error while preparing for trnasfer request. ',
            reason: 'invalid address format'
        }
        throw response;
    }
    console.log("prepared successfully. ", JSON.stringify(transactionPrepared));

    let signedTx;
    try {
        signedTx = await serverApi.sign(transactionPrepared.txJSON, transferReqObject.seed);
    } catch (e) {
        console.log("Error while siging the transactions. ", e);
        let response = {
            status : 'error',
            errorMsg : 'Not able to sign the transaction.',
            reason : 'xrp address / seed might be wrong'
        }
        throw response;
    }

    console.log("Signed successfully. ", JSON.stringify(signedTx));

    let submitTx;
    try {
       submitTx = await serverApi.submit(signedTx.signedTransaction);
    } catch (e) {
        console.log("Error while transfering the XRP: ", e);
        let response = {
            status : 'error',
            errorMsg : 'Error while transfering the XRP.',
            reason : 'XRP Amount might wrong.'
        };
        throw response;
    }
    console.log("Submitted successfully. ", JSON.stringify(submitTx));

    let response = {
        resultCode : submitTx.resultCode,
        resultMessage: submitTx.resultMessage,
        transactionId: submitTx.tx_json.hash
    }
    return response;
}

async function getTransaction(transactionId) {
    console.log("The getTransaction id is : ", transactionId);
    serverApi.connect().catch(err => {
        throw err;
    });

    let response = await serverApi.getTransaction(transactionId);
    return response;
}

module.exports.generateWallet = generateWallet;
module.exports.generateRandomWallet = generateRandomWallet;
module.exports.getBalance = getBalance;
module.exports.sendMoney = sendMoney;
module.exports.getTransaction = getTransaction;
