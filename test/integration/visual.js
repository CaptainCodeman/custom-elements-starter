const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const config = require('./config.json')

const port = 4444

const currentDir = `${process.cwd()}/test/integration/screenshots/current`;
const baselineDir = `${process.cwd()}/test/integration/screenshots/baseline`;

describe('page screenshots are correct', function () {
  let server, browser, page;

  before(async function () {
    const express = require('express')
    const serveStatic = require('serve-static')
    const transformMiddleware = require('express-transform-bare-module-specifiers').default;

    const app = express()
    app.use(transformMiddleware())
    app.use(serveStatic('.'))

    server = app.listen(port)

    // Create the test directory if needed.
    if (!fs.existsSync(currentDir)) {
      fs.mkdirSync(currentDir);
    }
  });

  after((done) => server.close(done));

  beforeEach(async function () {
    browser = await puppeteer.launch(config.puppeteer);
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  for (prefix in config.viewports) {
    console.log(prefix + '...');

    const path = `${currentDir}/${prefix}`
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }

    describe(prefix, function () {
      beforeEach(async function () {
        return page.setViewport(config.viewports[prefix]);
      });
  
      for (const name of config.elements) {
        it(`/test/integration/${name}.html`, async function () {
          return takeAndCompareScreenshot(page, name, prefix);
        });
      }
    })
  }
});

async function takeAndCompareScreenshot(page, route, filePrefix) {
  // If you didn't specify a file, use the name of the route.
  let fileName = filePrefix + '/' + (route ? route : 'index');

  await page.goto(`http://127.0.0.1:${port}/test/integration/${route}.html`, { waitUntil: ['load', 'networkidle0'] });
  await page.screenshot({ path: `${currentDir}/${fileName}.png`, fullPage: true });
  return compareScreenshots(fileName);
}

function compareScreenshots(view) {
  return new Promise((resolve, reject) => {
    const img1 = fs.createReadStream(`${currentDir}/${view}.png`).pipe(new PNG()).on('parsed', doneReading);
    const img2 = fs.createReadStream(`${baselineDir}/${view}.png`).pipe(new PNG()).on('parsed', doneReading);

    let filesRead = 0;
    function doneReading() {
      // Wait until both files are read.
      if (++filesRead < 2) return;

      // The files should be the same size.
      expect(img1.width, 'image widths are the same').equal(img2.width);
      expect(img1.height, 'image heights are the same').equal(img2.height);

      // Do the visual diff.
      const diff = new PNG({ width: img1.width, height: img1.height });

      const width = img1.width;
      const height = img1.height;

      const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data,
        width, height, { threshold: 0.2 });
      const percentDiff = numDiffPixels / (width * height) * 100;
      diff.pack().pipe(fs.createWriteStream(`${currentDir}/${view}.diff.png`));

      const stats = fs.statSync(`${currentDir}/${view}.png`);
      const fileSizeInBytes = stats.size;
      console.log(`${view}.png => ${fileSizeInBytes} bytes, ${percentDiff}% different`);

      expect(numDiffPixels, 'number of different pixels').equal(0);
      resolve();
    }
  });
}
