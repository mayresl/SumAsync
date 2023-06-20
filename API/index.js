const express = require('express')
const bodyParser = require('body-parser')
 
const app = express()
const port = 5000;
 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
 
app.get('/GetResult', (req, res) => {
  res.send(JSON.stringify('Hello World!'))
})
 
app.post('/CalcAsync', (req, res) => {
    let data = req.body;
    res.send('Data Received: ' + JSON.stringify(data));
})

app.listen(port, () => {
    console.log('Server started! At http://localhost:' + port)
})

//ref.: https://levelup.gitconnected.com/set-up-and-run-a-simple-node-server-project-38b403a3dc09
// run "node index.js" to start server