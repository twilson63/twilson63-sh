const express = require('express')
const app = express()
const helmet = require('helmet')
const bodyParser = require('body-parser')
const { get, createDoc } = require('./db')
const Keen = require('keen.io')

const client = Keen.configure({
  projectId: process.env.KEEN_PRJ,
  writeKey: process.env.KEEN_WRITE
})

app.use(helmet())

app.post('/api/surl', bodyParser.json(), (req, res) => {
  createDoc(req.body.url).then(r => res.send(r)) 
})

app.get('/:surl', (req, res) => {
  get(req.params.surl)
    .then(doc => {
      // log
      client.addEvent('hit', doc)
      res.redirect(doc.url)
    })
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.listen(3000)