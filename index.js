
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');


const METER_TABLE = process.env.METER_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
    res.send('Hello World!')
});

// Get User endpoint
app.get('/meter-read/:customerId', function (req, res) {
    const params = {
        TableName: METER_TABLE,
        Key: {
            customerId: req.params.customerId,
        },
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get reading' });
        }
        if (result.Item) {
            const {customerId, amount} = result.Item;
            res.json({ customerId, amount });
        } else {
            res.status(404).json({ error: "Reading not found" });
        }
    });
});

// Create User endpoint
app.post('/meter-read', function (req, res) {
    const { customerId, amount } = req.body;
    if (typeof customerId !== 'string') {
        res.status(400).json({ error: '"customerId" must be a string' });
    } else if (typeof amount !== 'number') {
        res.status(400).json({ error: '"amount" must be a number' });
    }

    const params = {
        TableName: METER_TABLE,
        Item: {
            customerId: customerId,
            amount: amount,
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not create reading' });
        }
        res.json({ customerId, amount });
    });
});

module.exports.handler = serverless(app);