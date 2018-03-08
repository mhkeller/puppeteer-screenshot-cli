#!/usr/bin/env node
/* globals document window */

const fs        = require('fs');
const puppeteer = require('puppeteer');
const chalk     = require('chalk');
const EOL       = '\n';
const t         = '%s';

const argsDef = [
  { name: 'list',     alias: 'l', type: String,  description: 'File path that contains a list of urls.' + EOL, defaultOption: false },
  { name: 'url',      alias: 'u', type: String,  description: 'URL to navigate page to. The url should include scheme, e.g. https://.' + EOL, defaultOption: true },
  { name: 'output',   alias: 'o', type: String,  description: 'The file path to save the image to. If path is a relative path, then it is resolved relative to current working directory. If using `--list`, put `%s` in your filename and it will be replaced with the index. If not provided, the `_${index}` will be added to the end of the filename. If no path is provided, the image won\'t be saved to the disk.' + EOL },
  { name: 'selector', alias: 's', type: String,  description: 'A CSS selector of an element to wait for. \n[italic]{Default: body}' + EOL },
  { name: 'type',     alias: 't', type: String,  description: 'Specify screenshot type, can be either jpeg or png. \n[italic]{Default: png}' + EOL },
  { name: 'quality',  alias: 'q', type: Number,  description: 'The quality of the image, between 0-100. Not applicable to png images.' + EOL },
  { name: 'width',    alias: 'w', type: Number,  description: 'Viewport width in pixels \n[italic]{Default: 800}' + EOL },
  { name: 'height',   alias: 'h', type: Number,  description: 'Viewport height in pixels \n[italic]{Default: 600}' + EOL },
  { name: 'delay',    alias: 'd', type: Number,  description: 'Time to wait (milliseconds) before screenshot is taken.{Default: 0}' + EOL, defaultValue: 0 },
  { name: 'timeout',              type: Number,  description: 'Maximum time to wait for in milliseconds. \n[italic]{Default: 30000}' + EOL },
  { name: 'scroll',               type: Boolean, description: 'Scroll to the bottom of the page.' + EOL },
  { name: 'fullPage', alias: 'f', type: Boolean, description: 'When true, takes a screenshot of the full scrollable page. \n[italic]{Defaults: false}.' + EOL },
  { name: 'noheadless',           type: Boolean, description: 'Allow disabling headless mode. \n[italic]{Default: false}' + EOL},
  { name: 'help',     alias: '?', type: Boolean, description: 'This help'  + EOL },
];

const args  = require('command-line-args')(argsDef);
const usage = require('command-line-usage')({ header: 'Headless screenshot with Puppeteer', optionList: argsDef });

async function doCapture({
  url,
  output,
  type,
  quality,
  delay,
  scroll,
  noheadless,
  selector = 'body',
  width    = 800,
  height   = 600,
  timeout  = 90000,
  fullPage = false,
}, i, len) {
  const browser = await puppeteer.launch({ headless: !noheadless });
  const page    = await browser.newPage();

  process.stdout.write(chalk.magenta('Visiting...') + ' ' + url);

  page.setDefaultNavigationTimeout(timeout);

  try {
    await page.setViewport({ width, height });

    await page.goto(url, { waitUntil: [ 'load', 'networkidle0' ] });

    await page.waitForSelector(selector, { visible: true, timeout });

    output  = output === '-' ? undefined : output;
    type    = type === 'jpg' ? 'jpeg' : type;

    if (i !== undefined) {
      if (output.indexOf(t) > -1) {
        output = output.replace(t, i);
      } else {
        // TODO, add this before the extension
        // output += `_${i}`;
      }
    }

    await page.waitFor(delay);
    if (scroll === true) {
      await page.evaluate(() => {
        function scrollBy (distance, duration, done) {
          var initialY = Math.abs(document.body.getBoundingClientRect().y);
          var y = initialY + distance;
          var baseY = (initialY + y) * 0.5;
          var difference = initialY - baseY;
          var startTime = window.performance.now();

          function step () {
            var normalizedTime = (window.performance.now() - startTime) / duration;
            if (normalizedTime > 1) normalizedTime = 1;

            window.scrollTo(0, baseY + difference * Math.cos(normalizedTime * Math.PI));
            if (normalizedTime < 1) {
              window.requestAnimationFrame(step);
            } else {
              done();
            }
          }
          window.requestAnimationFrame(step);
        }
        return new Promise((resolve) => {

          let counter = 0;
          let limit = 5;

          let atDepth = document.body.getBoundingClientRect().y;
          window.requestAnimationFrame(animate);

          function animate () {
            counter++;
            let viewportHeight = 500;
            let box = document.body.getBoundingClientRect();

            let depth = Math.abs(box.y) + viewportHeight;

            var body = document.body;
            var html = document.documentElement;

            var bottom = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

            let pixelsToScroll = bottom - depth;

            scrollBy(pixelsToScroll, 1000, function () {
              // console.log(atDepth, document.body.getBoundingClientRect().y);
              if (atDepth !== document.body.getBoundingClientRect().y) {
                counter = 0;
                atDepth = document.body.getBoundingClientRect().y;
              }

              // console.log(counter, limit);
              if (counter < limit) {
                // console.log('repeat');
                window.requestAnimationFrame(animate);
              } else {
                // console.log('done');
                resolve();
              }
            });
          }
        });
      });
    }

    const picture = await page.screenshot({
      type, quality, fullPage,
      path: output,
      clip: !fullPage && await (await page.$(selector)).boundingBox(),
    });

    if (!output) {
      process.stdout.write(picture);
    }

  } catch (error) {
    await browser.close();
    process.exitCode = 1;
    throw error;
  }

  // if (i === len - 1 || i === undefined) {
  await browser.close();
  // }
  process.stdout.write(chalk.green(' ✓') + EOL);
}

async function start () {
  if (args.help || (!args.url && !args.list)) {
    !args.help && process.stderr.write('No url provided.' + EOL);
    process.stderr.write(usage);
    process.exitCode = 1;
  } else {
    if (args.list) {
      const list = fs.readFileSync(args.list, 'utf-8')
        .trim()
        .split('\n')
        .filter(d => d.trim());
      const len = list.length;
      for (let i of Array.apply(null, Array(len)).map((d, i) => i)) {
        await doCapture(Object.assign({url: list[i]}, args), i, len);
      }
    } else {
      doCapture(args);
    }
  }
}

start();
