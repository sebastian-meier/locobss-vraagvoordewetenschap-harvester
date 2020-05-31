const {Translate} = require('@google-cloud/translate').v2;
const fs = require("fs").promises;

const themes = [];
const themesKeys = {};
const translate = new Translate();

fs.readFile("details.json-nd", "utf8")
  .then((json) => {
    const lines = json.split("\n");
    lines.forEach((line) => {
      if (line.length > 0) {
        const jLine = JSON.parse(line);
        jLine.themes.forEach((theme) => {
          if (!(theme.url in themesKeys)) {
            themes.push(theme);
            themesKeys[theme.url] = themes.length - 1;
          }
        });
      }
    });

    // first translate titles
    return Promise.all(themes.map((theme) => {
      return translate.translate(theme.title, "en");
    }));
  })
  .then((titles) => {
    titles.forEach((title, ti) => {
      themes[ti]["title_en"] = title;
    })
    // then translate content
    return Promise.all(themes.map((theme) => {
      return translate.translate(theme.content, "en");
    }));
  })
  .then((contents) => {
    contents.forEach((content, ti) => {
      themes[ti]["content_en"] = content;
    })
    return fs.writeFile("themes.json", JSON.stringify(themes), "utf8");
  })
  .then(() => {
    console.log("done");
  })
  .catch((err) => {
    throw err;
  });