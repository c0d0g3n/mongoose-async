const mongoose = require('mongoose')

const plugin = require('./plugin/plugin.js')

const timeout = (timeout) => new Promise((resolve) => {
  setTimeout(() => resolve(), timeout)
})

// SETUP MONGOOSE
mongoose.Promise = Promise
mongoose.connect('mongodb://localhost:27017/mongoose-async', {
  useMongoClient: true,
})
mongoose.connection.on('error', (err) => console.error(err))
mongoose.connection.on('open', () => console.log('db ok'))

// SCHEMA
const testSchema = new mongoose.Schema({
  test: {
    type: String,
    required: true,
    read: async (val, schemaType, doc) => {
      console.log('READ INPUT')
      console.log(val, '\t|', schemaType, '\t|', doc)

      await timeout(1000)

      return 'r ' + val
    },
    write: async (val, schemaType, doc) => {
      console.log('WRITE INPUT')
      console.log(val, '\t|', schemaType, '\t|', doc)

      return 'w ' + val
    },
  }
})
testSchema.plugin(plugin)
const TestModel = mongoose.model('Test', testSchema)

// TEST
const test = new TestModel({
  test: 'derp',
})

///////////////////////////
// SAVE > FIND > REMOVE
test
  .save()
  .then((doc) => {
    console.log('SAVE')
    console.log('doc:', doc)
    console.log('modified?', doc.isModified('test'))

    return TestModel.findById(doc.id)
  })
  .then((doc) => {
    console.log('FIND ONE')
    console.log('doc:', doc)
    console.log('modified?', doc.isModified('test'))

    // don't pollute db
    return doc.remove()
  })
  .then((doc) => {
    console.log('REMOVE')
    console.log('doc:', doc)
    console.log('modified?', doc.isModified('test'))
  })
  .catch((err) => console.error(err))

////////////////
// SAVE > REMOVE
// test
//   .save()
//   .then((doc) => {
//     console.log('SAVE')
//     console.log('doc:', doc)
//     console.log('modified?', doc.isModified('test'))
//
//     // don't pollute db
//     return doc.remove()
//   })
//   .then((doc) => {
//     console.log('REMOVE')
//     console.log('doc:', doc)
//     console.log('modified?', doc.isModified('test'))
//   })
//   .catch((err) => console.error(err))

//////////////////
// SAVE > FIND
// test
//   .save()
//   .then((doc) => {
//     console.log('SAVE')
//     console.log('doc:', doc)
//     console.log('modified?', doc.isModified('test'))
//
//     return TestModel.findById(doc.id)
//   })
//   .then((doc) => {
//       console.log('FIND ONE')
//       console.log('doc:', doc)
//       console.log('modified?', doc.isModified('test'))
//     })
//   .catch((err) => console.error(err))
