const puppeteer = require("puppeteer");
const fs = require("fs").promises;

// TODO: 2351 Duplicate

const start = 4153;

const getUrls = (page, pageUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      await page.waitFor(250);
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36");
      await page.goto(`https://www.vraagvoordewetenschap.be${pageUrl}`);
      const metadata = await page.evaluate(() => {
        const metadata = {
          answered: false,
          date: "",
          description: "",
          description_alt: "",
          person: "",
          question: "",
          score: "",
          themes: [],
        };

        const queries = [
          ["date", ".meta-wrap .datetime"],
          ["description", ".content.article>p"],
          ["person", ".meta-wrap .person"],
          ["question", ".content.article h2"],
          ["score", ".post_scores.scores .total .icon"],
        ];

        queries.forEach((query) => {
          if (document.querySelector(query[1]) !== null) {
            metadata[query[0]] = document.querySelector(query[1]).innerText;
          }
        });
        
        if (document.querySelector(".article.content") !== null) {
          document.querySelector(".article.content").childNodes.forEach((node) => { 
            if(node.nodeName === "#text" && node.nodeValue.trim().length > 0){
              metadata.description_alt = node.nodeValue.trim();
            }
          });
        }

        if (document.querySelectorAll(".raakvlakken .raakvlak_li") !== null) {
          document.querySelectorAll(".raakvlakken .raakvlak_li").forEach((theme) => {
            metadata.themes.push({
              url: theme.querySelector("a").getAttribute("href"),
              title: theme.querySelector(".title").innerText,
              content: theme.querySelector(".content").innerText
            });
          });
        }

        if (document.querySelector('.content.article .answers') !== null) {
          if (document.querySelector('.content.article .answers').style.display !== "none") {
            metadata.answered = true;
          }
        }

        return metadata;
      });

      metadata["id"] = pageUrl.split("/")[5];
      metadata["url"] = pageUrl;

      resolve(metadata);
    } catch (error) {
      reject(error);
    }
  });
};

let pBrowser;
let sites = [];

fs.readFile("urls.json-nd", "utf8")
  .then((json) => {
    const lines = json.split("\n");
    lines.forEach((line) => {
      if (line.length > 0) {
        const jLine = JSON.parse(line);
        jLine.forEach((url) => {
          sites.push(url);
        });
      }
    });

    return puppeteer
      .launch({
        args: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--window-size=1920x1080'
      ]});
  })
  .then((browser) => {
    pBrowser = browser;
    return browser.newPage();
  })
  .then(async (page) => {
    if (start === 0) {
      await fs.writeFile("details.json-nd", "", "utf8");
    }
    for (let i = start; i < sites.length; i += 1) {
      const result = await getUrls(page, sites[i]);
      await fs.appendFile("details.json-nd", JSON.stringify(result) + "\n");
      process.stdout.write(`${sites.length} / ${i}\r`);
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