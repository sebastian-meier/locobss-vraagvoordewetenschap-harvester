const fs = require("fs").promises;

const exclude = [
  'Question asked on VLIZ Marine Science Day # VMSD18',
  'ASO Roeselare',
  'at lecture VLIZ "Our coast viewed differently',
  'at VLIZ lecture "Our coast viewed differently"',
  'Free Primary School Ten Ede',
  'asked on Breakfast @ VLIZ-BIB',
  'Ask @Pint of Science',
  'collective ILVO brainstorm',
  ' at VLIZ lecture',
  ' years old)',
  ' years)',
  'Postcard from ',
  'Questions from ',
  'Questions by ',
  'Postcard by ',
  'Question from TADA, Future ATELIERdelAvenir',
  'Question by the Petrus & Paulus Center, Ostend',
  'Postkaart van ',
  'Postcard of ',
  'Tiebe DP postcard',
  'Interest',
  'Middle',
  'Health',
  'climate',
  'Mobility',
  'mobility',
  'middle'
];

const uniques = {description: [], question: []};
const duplicates = {description: {}, question: {}};

function checkForDuplicates (type, value) {
  if (uniques[type].indexOf(value) === -1) {
    uniques[type].push(value);
  } else {
    if (!(value in duplicates[type])) {
      duplicates[type][value] = 1;
    }
    duplicates[type][value] += 1;
  }
}

function cleanString(str) {
  return str.split('\n').join(' ').split('\t').join(' ');
}

function themeMatrix(themes, obj) {
  let line = '';
  const themeMap = [];
  obj.themes.forEach((theme) => {
    themeMap.push(theme.url.split('=')[1]);
  });
  for(const id in themes) {
    line += '\t';
    if (themeMap.includes(id)) {
      line += themes[id];
    } else {
      line += 'else';
    }
  }
  return line;
}

Promise.all([
  fs.readFile("questions.json", "utf8"),
  fs.readFile("themes.json", "utf8")
])
  .then((text) => {
    const json = JSON.parse(text[0]);
    const themes = JSON.parse(text[1]);
    const themesMap = {};

    themes.forEach((theme) => {
      themesMap[theme.url.split('=')[1]] = theme.content_en[0];
    });

    let exportAllTxt = '';
    let exportQTxt = '';
    let exportDTxt = '';

    let header = 'question';
    for (id in themesMap) {
      header += '\t' + themesMap[id];
    }
    header += '\n';

    let metaAllTsv = header;
    let metaQTsv = header;
    let metaDTsv = header;

    json.forEach((obj) => {
      let description = '';

      if ('description_alt_en' in obj) {
        description = obj.description_alt_en[0];
      } else if ('description_en' in obj) {
        description = obj.description_en[0];
      }
      if (description !== '') {
        let add = true;
        exclude.forEach((ex) => {
          if (description.indexOf(ex) !== -1) {
            add = false;
          }
        })
        if (add) {
          checkForDuplicates('description', description);
          exportAllTxt += cleanString(description) + '\n';
          exportDTxt += cleanString(description) + '\n';

          metaAllTsv += cleanString(description) + themeMatrix(themesMap, obj) + '\n';
          metaDTsv += cleanString(description) + themeMatrix(themesMap, obj) + '\n';
        }
      }
      if ('question_en' in obj) {
        checkForDuplicates('question', obj.question_en[0]);
        exportAllTxt += cleanString(obj.question_en[0]) + '\n';
        exportQTxt += cleanString(obj.question_en[0]) + '\n';

        metaAllTsv += cleanString(obj.question_en[0]) + themeMatrix(themesMap, obj) + '\n';
        metaQTsv += cleanString(obj.question_en[0]) + themeMatrix(themesMap, obj) + '\n';
      }
    });

    return fs.writeFile("exports/export.txt", exportAllTxt, "utf8")
      .then(() => fs.writeFile("exports/exportQuestions.txt", exportQTxt, "utf8"))
      .then(() => fs.writeFile("exports/exportDescriptions.txt", exportDTxt, "utf8"))
      .then(() => fs.writeFile("exports/meta.tsv", metaAllTsv, "utf8"))
      .then(() => fs.writeFile("exports/metaQuestions.tsv", metaQTsv, "utf8"))
      .then(() => fs.writeFile("exports/metaDescriptions.tsv", metaDTsv, "utf8"));
  })
  .then(() => {
    // console.log(duplicates);
    console.log("done");
  })
  .catch((err) => {
    throw err;
  });