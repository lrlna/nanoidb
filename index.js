var Nanobus = require('nanobus')
var assert = require('assert')

module.exports = Nanoidb

function Nanoidb (name, version) {
  if (!(this instanceof Nanoidb)) return new Nanoidb(name, version)
  Nanobus.call(this, 'Nanoidb')

  this._name = name
  this._version = version

  assert.equal(typeof name, 'string', 'Nanoidb: name should be type string')
  assert.equal(typeof version, 'number', 'Nanoidb: version should be type number')

  this.upgrade(this._version)
}

Nanoidb.prototype = Object.create(Nanobus.prototype)

Nanoidb.prototype.upgrade = function (version) {
  assert.equal(typeof version, 'number', 'Nanoidb.upgrade: version should be type number')
  this._version = version

  this.db = window.indexedDB.open(this._name, this._version)

  this.db.onerror = this.onerror.bind(this)
  this.db.onsuccess = this.onsuccess.bind(this)
  this.db.onupgradeneeded = this.onupgradeneeded.bind(this)
}

Nanoidb.prototype.onsuccess = function (event) {
  var storeNames = event.target.result.objectStoreNames
  var self = this

  var stores = Object.keys(storeNames).reduce(function (stores, key) {
    var name = storeNames[key]
    stores[name] = new Store(name, self.db.result)
    return stores
  }, {})

  this.emit('open', stores)
}

Nanoidb.prototype.onerror = function (event) {
  this.emit('error', this.db.error)
}

Nanoidb.prototype.onupgradeneeded = function (event) {
  this.emit('upgrade', {
    db: this.db.result,
    event: event
  })
}

function Store (name, db) {
  this.name = name
  this.db = db
}

Store.prototype.put = function (key, val, cb) {
  assert.equal(typeof key, 'string', 'Nanoidb.Store.put: key should be type string')
  assert.notEqual(typeof val, 'undefined', 'Nanoidb.Store.put: val should not be type undefined')
  assert.equal(typeof cb, 'function', 'Nanoidb.Store.put: cb should be type function')

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
  assert.equal(typeof key, 'string', 'Nanoidb.Store.get: key should be type string')
  assert.equal(typeof cb, 'function', 'Nanoidb.Store.get: cb should be type function')

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

Store.prototype.getAll = function (query, count, cb) {
  var transaction = this.db.transaction(this.name, 'readonly')
  var store = transaction.objectStore(this.name)

  if (typeof query === 'function') {
    var res = store.getAll()
    cb = query
  } else if (typeof query === 'string') {
    res = store.getAll(query, count)
  }

  transaction.oncomplete = function (event) {
    cb(null, res.result)
  }

  transaction.onerror = function () {
    cb(transaction.error)
  }
}

Store.prototype.del = function (key, cb) {
  assert.equal(typeof key, 'string', 'Nanoidb.Store.del: key should be type string')
  assert.equal(typeof cb, 'function', 'Nanoidb.Store.del: cb should be type function')

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
    assert.ok(self.cb, 'Nanoidb.Batch: no callback found; did you forget to call .flush()?')
    self.cb()
  }

  this.tx.onerror = function () {
    assert.ok(self.cb, 'Nanoidb.Batch: no callback found; did you forget to call .flush()?')
    self.cb(self.tx.error)
  }
}

Batch.prototype.put = function (key, val) {
  assert.equal(typeof key, 'string', 'Nanoidb.Batch.put: key should be type string')
  assert.notEqual(typeof val, 'undefined', 'Nanoidb.Batch.put: val should not be type undefined')

  this.store.put(val, key)
  return this
}

Batch.prototype.del = function (key) {
  assert.equal(typeof key, 'string', 'Nanoidb.Batch.del: key should be type string')

  this.store.delete(key)
  return this
}

Batch.prototype.flush = function (cb) {
  assert.equal(typeof cb, 'function', 'Nanoidb.Batch.flush: cb should be type function')

  this.cb = cb
}
