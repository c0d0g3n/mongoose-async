const isPromise = require('is-promise')

module.exports = (setters, options) => function () {
  const doc = this
  const promises = []

  for (const path in setters) {
    const setter = setters[path]

    // execute setter always || execute setter when path was modified
    if (options.applyOn === 'save' || doc.isModified(path)) {
      const val = doc[path]
      const schemaType = doc.schema.paths[path]

      // execute setter (this = doc)
      let result = setter.call(doc, val, schemaType, doc)

      if (isPromise(result)) {
        // async setter
        result = result.then((result) => applySetter(doc, path, result))

        // collect promises for tracking
        promises.push(result)
      } else {
        // sync setter
        applySetter(doc, path, result)
      }
    }
  }

  return Promise.all(promises)
}

const applySetter = (doc, path, result) => {
  // only override if setter actually changed something
  // path should be marked as modified, setter needs to persist to db
  if (doc[path] !== result) doc[path] = result
}
