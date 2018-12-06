const bs = require('browser-sync').create();

const express = require('express')
const compression = require('compression')
const cache = require('express-cache-headers');

const app = express()

const transformMiddleware = require('express-transform-bare-module-specifiers').default;

app.use('/node_modules/*', cache(3600))
app.use(compression())
app.use(transformMiddleware())

bs.init({
  server: true,
  files: [
    'index.html',
    'dist/**/*',
    'test/**/*',
  ],
  middleware: [app]
})
