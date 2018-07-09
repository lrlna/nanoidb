var html = require('choo/html')
var log = require('choo-log')
var Nanoidb = require('./')
var choo = require('choo')

var app = choo()

app.route('/', MainView)

app.use(log())
var db = Nanoidb('catStore', 1)
db.on('upgrade', function (diffData) {
  diffData.db.createObjectStore('catStore')
})

db.on('open', function (stores) {
  putOp(stores.catStore)

  function putOp (store) {
    stores.catStore.put('key-12345', 'ChashuCat', function (err) {
      if (err) throw err
      console.log('put done')
      batchOp(stores.catStore)
      getOp(stores.catStore)
      getAllOp(stores.catStore)
    })
  }

  function getAllOp (store) {
    store.getAll('dang', 10, function (err, values) {
      if (err) throw err
      values.forEach(function (value) {
        console.log('new value', value)
      }) 
    })
  }

  function getOp (store) {
    store.get('key-12345', function (err, val) {
      if (err) throw err
      console.log('get value', val)
      deleteOp(store)
    })
  }

  function deleteOp (store) {
    store.del('catStore', function (err) {
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
