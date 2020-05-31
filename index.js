const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const limit = 1759;
const start = 0;

const getUrls = (page, pageNum) => {
  return new Promise(async (resolve, reject) => {
    try {
      await page.waitFor(250);
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36");
      await page.goto(`https://www.vraagvoordewetenschap.be/p/thema_zoek?c=&search=&order=vvdw_all&page=${pageNum}`);
      const urls = await page.evaluate(() => {
        const items = document.querySelectorAll(".ideas li>div>a");
        const urls = [];
        items.forEach((item) => {
          const href = item.getAttribute("href");
          if (!urls.includes(href)) {
            urls.push(href);
          }
        });
        return urls;
      });
      resolve(urls);
    } catch (error) {
      reject(error);
    }
  });
};

let pBrowser;

puppeteer
  .launch({
    args: [
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--window-size=1920x1080'
  ]})
  .then((browser) => {
    pBrowser = browser;
    return browser.newPage();
  })
  .then(async (page) => {
    if (start === 0) {
      await fs.writeFile("urls.json-nd", "", "utf8");
    }
    for (let i = start; i <= limit; i += 1) {
      const result = await getUrls(page, i);
      await fs.appendFile("urls.json-nd", JSON.stringify(result) + "\n");
      process.stdout.write(`${limit} / ${i}\r`);
    }
    return Promise.resolve();
  })
  .catch((err) => {
    console.log(err)
  })
  .finally(() => {
    pBrowser.close();
    process.exit();
  });