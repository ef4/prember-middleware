/* eslint-env node */
'use strict';
const cleanBaseURL = require('clean-base-url');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = {
  name: 'prember-middleware',

  serverMiddleware({ app, options }) {
    let { watcher } = options;
    let baseURL = options.rootURL === '' ? '/' : cleanBaseURL(options.rootURL || options.baseURL);

    app.use((req, res, next) => {
      watcher.then(results => {
        if (req.serveUrl) {
          let assetPath = path.join(results.directory, req.path.slice(baseURL.length), 'index.html');
          let isFile = false;
          try { isFile = fs.statSync(assetPath).isFile(); } catch (err) { /* ignore */ }
          if (isFile) {
            /* eslint no-console:0 */
            console.log(chalk.yellow("prember: ") + "serving prerendered static HTML for " + req.url);
            req.url = path.join(req.url, 'index.html');
            req.serveUrl = null;
            req.headers['x-broccoli'].filename = assetPath;
          }
        }
      }).finally(next);
    });

  }
};
