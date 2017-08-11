const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-adapter-http'))
PouchDB.plugin(require('pouchdb-upsert'))
const { evolve, inc, compose, merge, prop } = require('ramda')
const Hashids = require('hashids')
const hashids = new Hashids()

const db = PouchDB(process.env.SURL_DB)

const createDoc = (url) =>
  db.upsert('_local/surl', compose(
    evolve({counter: inc}),
    merge({counter: 100})
  ))
  .then(doc => db.get(doc.id))
  .then(prop('counter'))
  .then(v => hashids.encode(Number(v)))
  .then(surl =>
    db.put({
      _id: surl,
      url,
      surl: 'https://twilson63.sh/' + surl
    })
  )
  //.then(res => {console.log(res))
  .catch(err => console.log(err))

const get = id => db.get(id)

module.exports = {
  get,
  createDoc
}
