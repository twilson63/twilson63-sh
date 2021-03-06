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

app.get('/offline.html', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/upup.min.js', (req, res) => {
  res.sendFile(__dirname + '/upup.min.js')
})

app.get('/upup.sw.min.js', (req, res) => {
  res.sendFile(__dirname + '/upup.sw.min.js')
})

app.get('/tachyons.min.css', (req, res) => {
  res.sendFile(__dirname + '/node_modules/tachyons/css/tachyons.min.css')
})

app.get('/animate.min.css', (req, res) => {
  res.sendFile(__dirname + '/node_modules/animate.css/animate.min.css')
})
app.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/favicon.ico')

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
