const express = require('express')
const bodyParser = require('body-parser')
const {MongoClient} = require('mongodb');
var amqp = require('amqplib/callback_api');
 
const uri = "mongodb://root:example@127.0.0.1:27017/"
const app = express()
const port = 5000;
 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
 
app.get('/GetResult', async (req, res) => {
  try {
    var data = await getSumOperations()
    res.send(data)
  }
  catch(e) {
    res.send(JSON.stringify(e))
  }
})
 
app.post('/CalcAsync', async (req, res) => {
    let doc = req.body
    doc.status = "pending"
    doc.result = null
    try {
      var id = await insertSum(doc)
      var msg = JSON.stringify(id.insertedId)
      await queueSum(msg)
      //res.send(JSON.stringify("Sum added to database"))
    }
    catch(e) {
      res.send(JSON.stringify(e))
    }
})

app.listen(port, () => {
    console.log('Server started! At http://localhost:' + port)
})


async function insertSum(document) {
  const client = new MongoClient(uri);
  var result = ""
  try {
    await client.connect();
    const db = client.db("operationsDB");
    const collection = db.collection("sums");
    result = await collection.insertOne(document);
  } catch (e) {
      console.error(e);
  }
  finally {
    setTimeout(() => {client.close()}, 1500)
  }
  return result
}

async function getSumOperations() {
  const client = new MongoClient(uri);
  var data = []
  try {
    await client.connect();
    const db = client.db("operationsDB");
    data = await db.collection('sums').find().toArray();
  } catch (e) {
      console.error(e);
  }
  finally {
    setTimeout(() => {client.close()}, 1500)
  }

  return data
}

async function queueSum(id) {
  try {
    amqp.connect('amqp://localhost', function(error0, connection) {
      if (error0) {
          throw error0;
      }
      connection.createChannel(function(error1, channel) {
          if (error1) {
              throw error1;
          }

          var queue = 'sumsQueue';
          channel.assertQueue(queue, {
              durable: true //making sure queue will survive a RabbitMQ node restart
          });
          channel.sendToQueue(queue, Buffer.from(id));

          setTimeout(() => {
            connection.close()
          }, 500)
      });    
    });
  } catch (e) {
      console.error(e);
  }
}