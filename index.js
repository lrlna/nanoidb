var html = require('choo/html')
var log = require('choo-log')
var Nanodb = require('./idb')
var choo = require('choo')

var app = choo()

app.route('/', MainView)

app.use(log())
var db = Nanodb('butts', 1)
db.on('upgrade', function (db) {
  db.createObjectStore('butts')
})

db.on('open', function (stores) {
  stores.butts.put('butts', 'voluptuous', function (err) {
    if (err) console.log(err)
    console.log('done')
    stores.butts.del('butts', function (err) {
      if (err) console.log(err)
      console.log('deleted')
    })
  })
})

app.mount('body')

function MainView () {
  return html`
    <body>
      <div> harrrroooo yosh </div>
    </body>
  `
}
