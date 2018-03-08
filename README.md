# Puppeteer screenshot CLI

Simple wrapper around [Puppeteer](https://github.com/GoogleChrome/puppeteer) to take screenshot from command line.

## What's in this fork?

Adds the following options

* `--list` will load a list of urls from a newline-delimited text file
* `--delay` will wait a specified amount of time before taking the screenshot
* `--scroll` will scroll to the bottom of the page before taking the screenshot. This is useful for infinite scroll style pages.

## Usage

```shell
npm i [-g] puppeteer-screenshot-cli

puppeteer-screenshot --url 'http://perdu.com' --selector 'h1' --output ./perdu.jpg
puppeteer-screenshot -u 'http://perdu.com' -s 'body' -o - > /tmp/perdu.jpg
puppeteer-screenshot 'http://perdu.com' > perdu.jpg

```

### Options

```
Headless screenshot with Puppeteer

  -l, --list string       File path that contains a list of urls.

  -u, --url string        URL to navigate page to. The url should include scheme, e.g. https://.

  -o, --output string     The file path to save the image to. If path is a relative path, then it is
                          resolved relative to current working directory. If no path is provided, the
                          image won't be saved to the disk.

  -s, --selector string   A CSS selector of an element to wait for.
                          Default: body

  -t, --type string       Specify screenshot type, can be either jpeg or png.
                          Default: png

  -q, --quality number    The quality of the image, between 0-100. Not applicable to png images.

  -w, --width number      Viewport width in pixels
                          Default: 800

  -h, --height number     Viewport height in pixels
                          Default: 600

  -d, --delay number      Time to wait (milliseconds) before screenshot is taken.{Default: 0}

  --timeout number        Maximum time to wait for in milliseconds.
                          Default: 30000

  --scroll                Scroll to the bottom of the page.

  -f, --fullPage          When true, takes a screenshot of the full scrollable page.
                          Defaults: false.

  --noheadless            Allow disabling headless mode.
                          Default: false

  -?, --help              This help
```

## See also

- [puppeteer-trace-cli](https://www.npmjs.com/package/puppeteer-trace-cli)
  Simple wrapper around [Puppeteer](https://github.com/GoogleChrome/puppeteer) to trace webpage from command line.
