const {Translate} = require('@google-cloud/translate').v2;
const fs = require("fs").promises;

const keys = ["description", "description_alt", "question"];

const translations = [];
const details = [];
const translate = new Translate();

fs.readFile("details.json-nd", "utf8")
  .then(async (json) => {
    const lines = json.split("\n");
    lines.forEach((line, li) => {
      if (line.length > 0) {
        const jLine = JSON.parse(line);
        details.push(jLine);

        keys.forEach((key) => {
          if (jLine[key].length > 0) {
            translations.push({
              id: li,
              key,
              original: jLine[key]
            });
          }
        });
      }
    });

    console.log(translations.join("").length);
  })
  .catch((err) => {
    throw err;
  });