# Mongoose Async
> Little mongoose plugin that mocks getters/setters and accepts promises (async)

## Preface ([skip to installation](#installation))
Let's face it, Mongoose works great until it does not&trade;. Searching for another way to make my code more elegant, I decided that most of my schema's pre and post hooks should go into getters and setters. However, most hooks rely on asynchronous functions or promises and Mongoose does not currently support that. (To be fair, this is acually a JavaScript limitation, but Mongoose could've implemented getter/setter functionality in a different way.)

That said, I started thinkering with ways to get around this limitation, and this plugin is what I've come up with. It's certainly not the only way to accomplish asynchronous getters and setters, probably not even the best way, but it does what I had in mind.

Feel free to improve, comment or critique this plugin and make sure to **follow [#4227](https://github.com/Automattic/mongoose/issues/4227)** because the functionality this plugin is trying to "polyfill" may or may not land in the core of Mongoose soon.

## Installation
    npm install mongoose-async

or

    yarn add mongoose-async

## Usage
### Activate the plugin
    const mongoose = require('mongoose')
    const mongooseAsync = require('mongoose-async')

    // mongoose schema that needs async getters/setters
    const schema = new mongoose.Schema({...})

    // add plugin to schema (options see below)
    schema.plugin(mongooseAsync, options)

Alternatively (add to every schema):

    const mongoose = require('mongoose')
    const mongooseAsync = require('mongoose-async')

    mongoose.plugin(mongooseAsync, options)

[Mongoose plugin docs](http://mongoosejs.com/docs/plugins.html)

### Add getters/setters
To avoid conflicts, you can define a getter using the `read` property (instead of `get`) and a setter using the `write` property (instead of `set`).

    const schema = new mongoose.Schema({
      somePath: {
        type: String,
        // ...
        read: async (value, schemaType, document) => {
          // do something async
          return 'value that your code sees'
        },
        write: async (value, schemaType, document) => {
          // do something async
          return 'value that is stored in database'
        }
      }
    })

Note synchronous functions work too.

Although not tested, you should still be able to use Mongoose native [getters](http://mongoosejs.com/docs/api.html#schematype_SchemaType-get) and [setters](http://mongoosejs.com/docs/api.html#schematype_SchemaType-set) without complications.

Also remember the **getters** of this plugin get **always applied**. Native getters do not get applied by default when `doc.toJSON` or `doc.toObject` are called. You can change this behavior as done below:

    schema.set('toJSON', {getters: true})
    schema.set('toObject', {getters: true})

### Options
This plugin currently has only one option: `setters.applyOn`.

Below is the defaults object for reference:

    const defaults = {
      getters: {},
      setters: {
        applyOn: 'save',
        // (enum) When setters should be applied
        // change: only execute when path was modified (behaves like an ordinary setter)
        // save: execute every time before saving
      }
    }

## How it works
- Getter logic is located in `./src/applyGetters.js`.
- Setter logic is located in `./src/applySetters.js`.
- `applyGetters.js` is executed on schema **post init** (obtaining a document from db) and **post save** (modifies return value of `doc.save()`).
- `applySetters.js` is executed on schema **pre save** (saving).
  - Should possibly be hooked to **pre validate** so validation is done on result of setter. (?)
- On initialization, plugin looks for schema paths that have a `read` and/or `write` property set (should be a function), and stores result in object.
  - Objects are passed to `applyGetters.js` and `applySetters.js`.
