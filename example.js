var html = require('choo/html')
var log = require('choo-log')
var Nanoidb = require('./')
var choo = require('choo')

var app = choo()

app.route('/', MainView)

app.use(log())
var db = Nanoidb('butts', 1)
db.on('upgrade', function (diffData) {
  diffData.db.createObjectStore('butts')
})

db.on('open', function (stores) {
  putOp(stores.butts)

  function putOp (store) {
    stores.butts.put('butts', 'cute', function (err) {
      if (err) throw err
      console.log('put done')
      getOp(stores.butts)
    })
  }

  function getOp (store) {
    store.get('butts', function (err, val) {
      if (err) throw err
      console.log('get value', val)
      deleteOp(store)
    })
  }

  function deleteOp (store) {
    store.del('butts', function (err) {
      if (err) throw err
      console.log('deleted')
      batchOp(store)
    })
  }

  function batchOp (store) {
    store.batch()
      .put('coolThang', 'hell yea')
      .put('dang', 'no wayyy')
      .put('ding', 'whoaaa yea')
      .del('ding')
      .flush(function (err) {
        if (err) throw err
        console.log('it flushed successfully')
      })
  }
})

app.mount('body')

function MainView () {
  return html`
    <body>
      <div> harrrroooo </div>
    </body>
  `
}
