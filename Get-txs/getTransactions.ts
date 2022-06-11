import express = require('express');
import Axios from 'axios';
const bodyParser = require("body-parser");
const DBHost = `mongodb+srv://eth-scan:12345@cluster0.xlntr.mongodb.net/transaction_list?retryWrites=true&w=majority`

const cron = require("node-cron");

const cors = require("cors");

const Web3 = require('web3');
var web3 = new Web3('https://eth-mainnet.alchemyapi.io/v2/0rIlJttmJhpi49SQpONpHcAyEnv-6299');

var MongoOneReq = require('mongodb').MongoClient;

let app = express()

app.options("*", cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));

app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));

app.use(bodyParser.json());

var transactions, result, transactions_db;
var currentBlock = 0, lastBlock = 0

async function insertTxs(data) {

  MongoOneReq.connect(DBHost, function (err, db) {

    if (err) throw err;

    var db_txs = db.db("txs_db");

    if (data.length > 0)

      db_txs.collection("transaction").insertMany(data, function (err, res) {

        if (err) throw err;

        db.close();

      });
  });

}

async function getTxs() {

  MongoOneReq.connect(DBHost, function (err, db) {

    if (err) throw err;

    var db_txs = db.db("txs_db");

    db_txs.collection("transaction").find({}).toArray(function (err, result) {

      if (err) throw err;

      transactions_db = result;

      db.close();

    });
  });

}

async function getBlocknumberAndInsertTx() {

  web3.eth.getBlockNumber().then(async function (blockCount) {

    console.log(blockCount)

    currentBlock = blockCount

    if (currentBlock >= lastBlock) {

      let res = await Axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26&startblock=${lastBlock}&endblock=${currentBlock}&page=1&offset=10&sort=asc&apikey=HSDW24V25F97PBGKZ632QDKWFHMHG4DN68`);

      transactions = JSON.parse(JSON.stringify(res.data))

      result = transactions.result

      if (result) insertTxs(result)

      lastBlock = currentBlock + 1

    }
  })
}

app.get("/getTransactions", (req, res) => {

  res.status(200).send(
    transactions_db
  )

})

cron.schedule("*/20 * * * * *", async function () {

  await getBlocknumberAndInsertTx()
  await getTxs();

});


const PORT = 4000

app.listen(PORT, function () { console.log('Server running') })

module.exports = app;





