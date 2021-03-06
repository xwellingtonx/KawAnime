const path = require('path')
const webpack = require('webpack')
const MFS = require('memory-fs')
const clientConfig = require(path.join(__dirname, 'webpack.client.config'))
const serverConfig = require(path.join(__dirname, 'webpack.server.config'))
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')

module.exports = function setupDevServer (app, cb) {
  let bundle, clientManifest
  let resolve
  let resolved = false
  const readyPromise = new Promise(r => { resolve = r }) // eslint-disable-line promise/param-names
  const ready = (...args) => {
    if (!resolved) resolve()
    cb(...args) // eslint-disable-line standard/no-callback-literal
  }

  // modify client config to work with hot middleware
  clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ProgressBarPlugin({
      format: chalk.cyan('> build') + ' [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
      clear: true
    })
  )

  // dev middleware
  const clientCompiler = webpack(clientConfig)
  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    noInfo: true
  })
  app.use(devMiddleware)
  clientCompiler.plugin('done', () => {
    const fs = devMiddleware.fileSystem
    const readFile = file => fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
    clientManifest = JSON.parse(readFile('vue-ssr-client-manifest.json'))
    if (bundle) {
      ready(bundle, {
        clientManifest
      })
    }
  })

  // hot middleware
  app.use(require('webpack-hot-middleware')(clientCompiler))

  // watch and update server renderer
  const serverCompiler = webpack(serverConfig)
  const mfs = new MFS()
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    const readFile = file => mfs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')

    // read bundle generated by vue-ssr-webpack-plugin
    bundle = JSON.parse(readFile('vue-ssr-server-bundle.json'))
    if (clientManifest) {
      ready(bundle, {
        clientManifest
      })
    }
  })

  return readyPromise
}
