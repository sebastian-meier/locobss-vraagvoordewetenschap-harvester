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

    for (let ti = 0; ti < translations.length; ti += 1) {
      const result = await translate.translate(translations[ti].original, "de");
      details[translations[ti].id][translations[ti].key + "_de"] = result;
      process.stdout.write(`${translations.length} / ${ti}\r`);
    }

    return fs.writeFile("questions_de.json", JSON.stringify(details), "utf8");
  })
  .then(() => {
    console.log("done");
  })
  .catch((err) => {
    throw err;
  });