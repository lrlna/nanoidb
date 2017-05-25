# nanoidb
[![npm version][1]][2] [![build status][3]][4]
[![downloads][5]][6] [![js-standard-style][7]][8]

IndexedDB is a web-api for client-side storage, and although widely used, the API
itself is at times confusing. Nanoidb is small wrapper to help standardize most
useful methods in a callback based fashion.

IndexedDB is an async transactional database that lets you store objects as
`<key, value>` pairs. The pairs get stored in object stores that are
essentially a set of database tables, but in an indexedDB context.  

# Usage
```js
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
```

## API 
### `db = Nanoidb(name, version)`
This creates an instance of IndexedDB. It takes in a database `name` and
`version`. IndexedDB's versioning starts with 1, rather than 0. 

### `db.on('upgrade', callback(diffData))`
Returns an object composed of a previously created indexedDB and a
IDBVersionChangeEvent. This is where you should create your object store by
calling `diffData.db.createObjectStore('<name>')`.

`diffData.event` provides you with an `oldVersion` property to help with
schema updates.

### `db.on('open', callback(stores))`
Returns an instance of an object store that you can later use.

### `store = stores.<name>`
Instance of an Object Store. 

### `store.put(key, val, callback(err))`
Given the Object Store you previously created, you can add a value to the
database via the `put` method. Takes an object `key`, `val`, and an error
callback.

### `store.get(key, callback(err, val))`
You can also get a value from the database with a `get`. Takes a `key` and an
error callback.

### `store.del(key, callback(err))`
Delete method takes a `key` and an error callback.

### `batch = store.batch()`
You can also batch chain `del` and `get` methods. When you're done, you have to
call a `.flush()` to handle your callback.

### `batch.put(key, val)`
Add an object within a batch operation. Takes a `key` and a `val`. 

### `batch.del(key)`
Delete an object within a batch operation. Takes a `key`.

### `batch.flush(callback(err))`
When working with a `batch()` method, you have to call a flush to handle your
errors. This just takes an error callback.

# Install
```bash
npm install nanoidb
```

# Related content
- [choo](https://github.com/yoshuawuyts/choo)
- [mdn/IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[1]: https://img.shields.io/npm/v/nanoidb.svg?style=flat-square
[2]: https://npmjs.org/package/nanoidb
[3]: https://img.shields.io/travis/lrlna/nanoidb/master.svg?style=flat-square
[4]: https://travis-ci.org/lrlna/nanoidb
[5]: http://img.shields.io/npm/dm/nanoidb.svg?style=flat-square
[6]: https://npmjs.org/package/nanoidb
[7]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[8]: https://github.com/feross/standard
