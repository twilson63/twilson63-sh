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
  if (req.body && req.body.url) {
    createDoc(req.body.url).then(r => res.send(r)) 
  } else {
    res.status(500).send({message: 'JSON Body Required with valid URL'})
  }
  
})

app.get('/:surl', (req, res) => {
  if (req.params && req.params.surl) {
    get(req.params.surl)
      .then(doc => {
        // log
        client.addEvent('hit', doc)
        res.redirect(doc.url)
      })
      .catch(err => {
        client.addEvent('error', err)
        res.status(500).send({message: err.message})
      })
  } else {
    res.status(500).send({message: 'URL Code Requires'})
  }
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.listen(3000)