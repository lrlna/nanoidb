var Nanobus = require('nanobus')

module.exports = Nanodb

function Nanodb (name, version) {
  if (!(this instanceof Nanodb)) return new Nanodb(name, version)
  Nanobus.call(this, 'Nanodb')

  this._name = name
  this._version = version

  var self = this

  var db = window.indexedDB.open(this._name, this._version)

  db.onerror = function (event) {
    self.emit('error', db.error)
  }

  db.onsuccess = function (event) {
    var storeNames = event.target.result.objectStoreNames
    var stores = Object.keys(storeNames).reduce(function (stores, key) {
      var name = storeNames[key]
      stores[name] = new Store(name, db.result)
      return stores
    }, {})

    self.emit('open', stores)
  }

  db.onupgradeneeded = function (event) {
    self.emit('upgrade', db.result)
  }
}

Nanodb.prototype = Object.create(Nanobus.prototype)

function Store (name, db) {
  this.name = name
  this.db = db
}

Store.prototype.put = function (key, val, cb) {
  var transaction = this.db.transaction(this.name, 'readwrite')
  var store = transaction.objectStore(this.name)
  store.put(val, key)

  transaction.oncomplete = function (event) {
    cb()
  }

  transaction.onerror = function () {
    cb(transaction.error)
  }
}

Store.prototype.get = function (key, cb) {
  var transaction = this.db.transaction(this.name, 'readonly')
  var store = transaction.objectStore(this.name)
  var res = store.get(key)

  transaction.oncomplete = function (event) {
    cb(null, res.result)
  }

  transaction.onerror = function () {
    cb(transaction.error)
  }
}

Store.prototype.del = function (key, cb) {
  var transaction = this.db.transaction(this.name, 'readwrite')
  var store = transaction.objectStore(this.name)
  store.delete(key)

  transaction.oncomplete = function (event) {
    cb()
  }

  transaction.onerror = function () {
    cb(transaction.error)
  }
}
