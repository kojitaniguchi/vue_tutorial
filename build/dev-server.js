'use strict'
require('./check-versions')()

const config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

// middleweare関連--------------------------------------------------------------
const express = require('express')
const app = express()

// webpack関連--------------------------------------------------------------------------------------
const webpack = require('webpack')
const webpackConfig = (process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'production')
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

const compiler = webpack(webpackConfig)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})
app.use(devMiddleware)

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
app.use(hotMiddleware)


// proxy関連--------------------------------------------------------------------
const proxyOptionTable = config.dev.proxyOptionTable
const proxyMiddleware = require('http-proxy-middleware')
// proxy api requests
Object.keys(proxyOptionTable).forEach(function (context) {
  let options = proxyOptionTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// static assets----------------------------------------------------------------
const path = require('path')
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))
// HTML5 history API 非同期通信でページを更新した時に新しくURLを発行
app.use(require('connect-history-api-fallback')())

// port set---------------------------------------------------------------------
const port = process.env.PORT || config.dev.port
const uri = 'http://localhost:' + port
var portfinder = require('portfinder')
portfinder.basePort = port
console.log('> Starting dev server...')


// automatically open browser---------------------------------------------------
const opn = require('opn')
// if not set will be false
const autoOpenBrowser = !!config.dev.autoOpenBrowser

var _resolve
var _reject
var readyPromise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

devMiddleware.waitUntilValid(() => {
  portfinder.getPort((err, port) => {
    if (err) {
      _reject(err)
    }
    process.env.PORT = port
    var uri = 'http://localhost:' + port
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
      opn(uri)
    }
    var server
    server = app.listen(port)
    _resolve()
  })
})

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
