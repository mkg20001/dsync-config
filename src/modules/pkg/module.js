'use strict'

const { exec } = require('../../utils')

function PKG (name, ver, format) {
  const formatted = format.replace('NAME', name).replace('VER', ver)
  return {
    name,
    ver,
    formatted,
    toString: () => formatted,
    compare: other => other.name === name && other.ver === ver
  }
}

module.exports = function PKGModule (config) {
  async function genericInstall (cmd, multi, pkg) {
    const batches = multi ? [pkg] : pkg.map(p => [p])
    const splitIndex = cmd.indexOf('#')
    const pre = cmd.slice(0, splitIndex)
    const post = cmd.slice(splitIndex + 1)
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      if (batch.length) {
        await exec(pre.concat(batch).concat(post))
      }
    }
  }

  const parseFormatted = config.process.regex.match(/\/(.+)\/(.+)/)
  const parseRegex = new RegExp(parseFormatted[1], parseFormatted[2])
  const regexGroups = config.process['regex-groups']

  const processList = list => list
    .split('\n')
    .filter(Boolean)
    .map(str => str.match(parseRegex))
    .filter(Boolean) // TODO: list invalid entries
    .map(res => PKG(res[regexGroups.name], res[regexGroups.version], config.process['pkg-format']))

  return {
    list: async () => {
      const list = await exec(config.commands.list)
      return processList(String(list.stdout))
    },
    processList,
    install: pkgs => genericInstall(config.commands.install, config.commands['install.multi'], pkgs),
    remove: pkgs => genericInstall(config.commands.remove, config.commands['remove.multi'], pkgs),
    update: pkgs => genericInstall(config.commands['update.useinstall'] ? config.commands.install : config.commands.update, config.commands['update.multi'], pkgs)
  }
}
