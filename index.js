var Nanobus = require('nanobus')
var assert = require('assert')

module.exports = Nanodb

function Nanodb (name, version) {
  if (!(this instanceof Nanodb)) return new Nanodb(name, version)
  Nanobus.call(this, 'Nanodb')

  this._name = name
  this._version = version

  assert.equal(typeof name, 'string', 'Nanodb: name should be type string')
  assert.equal(typeof version, 'number', 'Nanodb: name should be type number')

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
  assert.equal(typeof key, 'string', 'Nanodb.Store.put: key should be type string')
  assert.notEqual(typeof val, 'undefined', 'Nanodb.Store.put: val should not be type undefined')
  assert.equal(typeof cb, 'function', 'Nanodb.Store.put: cb should be type function')

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
  assert.equal(typeof key, 'string', 'Nanodb.Store.get: key should be type string')
  assert.equal(typeof cb, 'function', 'Nanodb.Store.get: cb should be type function')

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
  assert.equal(typeof key, 'string', 'Nanodb.Store.del: key should be type string')
  assert.equal(typeof cb, 'function', 'Nanodb.Store.del: cb should be type function')

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

Store.prototype.batch = function () {
  return new Batch(this.name, this.db)
}

function Batch (name, db) {
  this.name = name
  this.db = db
  this.tx = this.db.transaction(this.name, 'readwrite')

  this.store = this.tx.objectStore(this.name)

  var self = this

  this.tx.oncomplete = function (event) {
    assert.ok(self.cb, 'Nanodb.Batch: no callback found; did you forget to call .flush()?')
    self.cb()
  }

  this.tx.onerror = function () {
    assert.ok(self.cb, 'Nanodb.Batch: no callback found; did you forget to call .flush()?')
    self.cb(self.tx.error)
  }
}

Batch.prototype.put = function (key, val) {
  assert.equal(typeof key, 'string', 'Nanodb.Batch.put: key should be type string')
  assert.notEqual(typeof val, 'undefined', 'Nanodb.Batch.put: val should not be type undefined')

  this.store.put(val, key)
  return this
}

Batch.prototype.del = function (key) {
  assert.equal(typeof key, 'string', 'Nanodb.Batch.del: key should be type string')

  this.store.delete(key)
  return this
}

Batch.prototype.flush = function (cb) {
  assert.equal(typeof cb, 'function', 'Nanodb.Batch.flush: cb should be type function')

  this.cb = cb
}
