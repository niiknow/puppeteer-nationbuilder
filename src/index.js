import fs from 'fs';
import path from 'path';
import chromium from 'chrome-aws-lambda';

const debug = require('debug')('puppeteer-nationbuilder');

async function waitForDownloadToComplete(fileName) {
  return new Promise((resolve) => {
    const dir      = path.dirname(fileName);
    const basename = path.basename(fileName);
    const watcher  = fs.watch(dir, function(eventType, filename) {
      if (eventType === 'rename' && filename === basename) {
        watcher.close();
        resolve();
      }
    });
  });
}

class PuppeteerNationBuilder {
  /**
   * Initialize an instance of PuppeteerNationBuilder
   *
   * @param Object opts  options object
   * @return             an instance of PuppeteerNationBuilder
   */
  constructor(namePrefix = 'nameprefix', opts = {}) {
    this.opts = opts;

    // init url
    if (!this.opts.url) {
      this.opts.url = `https://${namePrefix}.nationbuilder.com`;
    }

    return this;
  }

  async init() {
    // init browser
    if (!this.opts.browser) {
      this.opts.browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true
      });
    }
  }

  /**
   * Login and return the page that has logged in
   * @param  {String} login
   * @param  {String} password
   * @return {Object} the page object
   */
  async logIn(login, password) {
    await this.init();
    let page = await this.opts.browser.newPage();

    await Promise.all([
      page.waitForNavigation(),
      page.goto(`${this.opts.url}/admin/backups`)
    ]);

    await page.type('#user_session_email', login);
    await page.type('#user_session_password', password);
    await Promise.all([
      page.waitForNavigation(),
      page.click('.submit-button')
    ]);

    return page;
  }

  async createSnapshot(name='Daily snapshot') {
    await this.init();
    let page = await this.opts.browser.newPage();

    await Promise.all([
      page.waitForNavigation(),
      page.goto(`${this.opts.url}/admin/backups`)
    ]);
    await page.type('#nation_backup_comment', name);
    await Promise.all([
      page.waitForNavigation(),
      page.click('[name="commit"]')
    ]);

    return page;
  }

  async cleanSnapshot(keep=7, name='Daily snapshot') {
    await this.init();
    let page = await this.opts.browser.newPage();

    await Promise.all([
      page.waitForNavigation(),
      page.goto(`${this.opts.url}/admin/backups`)
    ]);

/*eslint-disable */
    let remain = keep + 1;
    while (remain > keep) {
      remain = await page.evaluate(async (name, keep) => {
        return await new Promise(resolve => {
          // hijack confirm
          window.confirm = function(msg) { return true; }
          const snapshots = [...document.querySelectorAll('td')]
            .filter(txt => txt.textContent.includes(name));

          let remain = snapshots.length;
          if (keep <= 1) {
            keep = 1
          }

          if (snapshots.length > keep) {
            const delLink = snapshots[snapshots.length - 1].parentNode.querySelector('a[data-method="delete"');
            if (delLink) {
              delLink.click();
              remain--;
            }
          }

          resolve(remain);
        });
      }, name, keep);
      debug('backup remain', remain)
    }
/*eslint-enable */

    return remain;
  }

  async fetchFirstSnapshot(downloadPath='/tmp/puppeteerdl', name='Daily snapshot') {
    await this.init();
    fs.existsSync(downloadPath) || fs.mkdirSync(downloadPath, { recursive: true });

    let page = await this.opts.browser.newPage();

    await Promise.all([
      page.waitForNavigation(),
      page.goto(`${this.opts.url}/admin/backups`)
    ]);

    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath
    });

    debug('Starting download...');

    return await new Promise(resolve => {
      // handle waiting for download to complete
      page.on('response', async response => {
        const url = response.request().url().split('?')[0];

        if (url.indexOf('.s3.amazonaws.com/') > 0) {
          const fileName = path.basename(url);
          const fullPath = `${downloadPath}/${fileName}`.replace(/\.+$/, '');
          debug('full path', fullPath);
          await waitForDownloadToComplete(fullPath);
          return resolve(fullPath);
        }
      });

  /*eslint-disable */
      page.evaluate((name) => {
        // hijack confirm
        window.confirm = function(msg) { return true; }

        const snapshots = [...document.querySelectorAll('td')]
          .filter(txt => txt.textContent.includes(name))

        if (snapshots && snapshots.length > 0) {
          snapshots[0].parentNode.querySelector('a[href$="/download"').click()
        }
      }, name)
  /*eslint-enable */
    });
  }
}

module.exports = PuppeteerNationBuilder;
