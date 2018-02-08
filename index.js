#!/usr/bin/env node

const puppeteer       = require('puppeteer');
const commandLineArgs = require('command-line-args');
const getUsage        = require('command-line-usage');

const argsDef = [
  { name: 'url',      alias: 'u', type: String,  description: 'Source URL\n', defaultOption: true },
  { name: 'output',   alias: 'o', type: String,  description: 'Output filename. \n[italic]{Default: screenshot.jpeg}\n' },
  { name: 'selector', alias: 's', type: String,  description: 'CSS selector of DOM element to capture. \n[italic]{Default: body}\n' },
  { name: 'type',     alias: 't', type: String,  description: 'Type of output image: png or jpeg. \n[italic]{Default: jpeg}\n' },
  { name: 'quality',  alias: 'q', type: Number,  description: 'Quality of jpeg file. Only for jpeg. \n[italic]{Default: 90}\n' },
  { name: 'width',    alias: 'w', type: Number,  description: 'Viewport width' },
  { name: 'height',   alias: 'h', type: Number,  description: 'Viewport height\n' },
  { name: 'fullPage', alias: 'f', type: Boolean, description: '\n' },
  { name: 'headless',             type: Boolean, },
  { name: 'help',     alias: '?', type: Boolean, description: 'This help' },
];

const args = commandLineArgs(argsDef);

const doCapture = async function ({
  url,
  selector = 'body',
  width    = 800,
  height   = 600,
  type     = 'jpeg',
  output   = `screenshot.${type}`,
  quality  = type === 'jpeg' ? 90 : undefined,
  headless = true,
  fullPage = false,
}) {
  const browser = await puppeteer.launch({headless});
  const page    = await browser.newPage();

  await page.setViewport({ width, height });

  await page.goto(url, { waitUntil: [ 'load', 'networkidle0' ] });

  await page.waitForSelector(selector, { visible: true });

  const elementHandle = await page.$(selector);

  await page.screenshot({
    type, quality, fullPage,
    path: output,
    clip: await elementHandle.boundingBox(),
  });

  await browser.close();
};

if (args.help) {
  console.log(getUsage({ header: 'Headless screenshot with Puppeteer', optionList: argsDef, hide: ['headless'] }));
} else if (args.url) {
  doCapture(args);
} else {
  console.log('No url provided...');
}