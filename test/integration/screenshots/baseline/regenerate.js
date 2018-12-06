const puppeteer = require('puppeteer');
const fs = require('fs');
const baselineDir = `${process.cwd()}/test/integration/screenshots/baseline`;
const config = require('../../config.json')
const port = 4444

async function generateBaselineScreenshots(page) {
  for (prefix in config.viewports) {
    const path = `${baselineDir}/${prefix}`
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }

    await page.setViewport(config.viewports[prefix]);

    for (const name of config.elements) {
      console.log(`${prefix} ${name}`);
      await page.goto(`http://127.0.0.1:${port}/test/integration/${name}.html`, { waitUntil: 'networkidle2' });

      await page.screenshot({ path: `${baselineDir}/${prefix}/${name}.png`, fullPage: true });
    }
  }
}

async function run() {
  const express = require('express')
  const serveStatic = require('serve-static')
  const transformMiddleware = require('express-transform-bare-module-specifiers').default;

  const app = express()
  app.use(transformMiddleware())
  app.use(serveStatic('.'))

  const server = app.listen(port)

  // Create the test directory if needed.
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir);
  }

  const browser = await puppeteer.launch(config.puppeteer);
  const page = await browser.newPage();

  await generateBaselineScreenshots(page)

  await page.close()
  await browser.close()

  server.close()
}

run()
