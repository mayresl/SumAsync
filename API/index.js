const express = require('express')
const bodyParser = require('body-parser')
const {MongoClient} = require('mongodb');
 
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
      await insertSum(doc)
      res.send(JSON.stringify("Sum added to database"))
    }
    catch(e) {
      res.send(JSON.stringify(e))
    }
})

app.listen(port, () => {
    console.log('Server started! At http://localhost:' + port)
})


async function insertSum(document) {
  const uri = "mongodb://127.0.0.1:27017/"
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("operationsDB");
    const collection = db.collection("sums");
    const result = await collection.insertOne(document);
  } catch (e) {
      console.error(e);
  }
  finally {
    setTimeout(() => {client.close()}, 1500)
  }
}

async function getSumOperations() {
  const uri = "mongodb://127.0.0.1:27017/"
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