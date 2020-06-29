'use strict'

module.exports = {
  parseConfig (str) {
    return str.split('\n').filter(Boolean).map(str => {
      const out = {}

      str.split(' ').map(str => {
        const [key, ...val] = str.split('=')
        return { key, val: val.join('=') }
      }).forEach(({ key, val }) => (out[key] = val))

      return out
    })
  }
}
