const applyGetters = require('./applyGetters.js')
const applySetters = require('./applySetters.js')

const defaults = {
  getters: {},
  setters: {
    applyOn: 'save',
    // change: only execute when path was modified
    // save: execute every time before saving
  }
}

module.exports = exports = function plugin (schema, options) {
  // merge defaults with options
  options = options ? {
    ...defaults,
    ...options,
    getters: {
      ...defaults.getters,
      ...options.getters,
    },
    setters: {
      ...defaults.setters,
      ...options.setters,
    },
  } : defaults

  const getters = {}
  const setters = {}

  // extract enhanced getters and setters from schema
  for (const id in schema.obj) {
    const value = schema.obj[id]

    // path is getter
    if (value.read instanceof Function) getters[id] = value.read

    // path is setter
    if (value.write instanceof Function) setters[id] = value.write
  }

  // apply getters
  schema.post('init', applyGetters(getters, options.getters))
  schema.post('save', applyGetters(getters, options.getters))

  // apply setters
  schema.pre('save', applySetters(setters, options.setters))
}
