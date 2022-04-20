const isPromise = require('is-promise')

module.exports = (getters, options) => function (doc) {
  // doc === this
  const promises = []

  for (const path in getters) {
    const getter = getters[path]

    const val = doc[path]
    const schemaType = doc.schema.paths[path]

    // execute getter (this = doc)
    let result = getter.call(doc, val, schemaType, doc)

    if (isPromise(result)) {
      // async getter
      result = result.then((result) => applyGetter(doc, path, result))

      // collect promises for tracking
      promises.push(result)
    } else {
      // sync getter
      applyGetter(doc, path, result)
    }
  }

  return Promise.all(promises)

}

const applyGetter = (doc, path, result) => {
  // only override if getter actually changed something
  if (doc[path] !== result) {
    // remember modified status
    const modified = doc.isModified(path)

    // write result to path
    doc[path] = result

    // unmark modified
    if (!modified) doc.unmarkModified(path)
  }
}
