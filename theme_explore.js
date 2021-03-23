const fs = require("fs").promises;

fs.readFile("themes.json", "utf8")
  .then(async (text) => {
    const json = JSON.parse(text);

    const structure = [];

    json.forEach((theme) => {
      structure.push([
        theme.url.split('=')[1],
        theme.content_en[0]
      ]);
    });
    
    structure.sort((a,b) => {
      return a[0] - b[0];
    });

    console.log(structure);
  })
  .then(() => {
    console.log("done");
  })
  .catch((err) => {
    throw err;
  });