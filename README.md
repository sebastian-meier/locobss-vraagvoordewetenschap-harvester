# vraagvoordewetenschap-scraper
For a research project we needed sample data for research questions from the public. Belgium conducted such a survey: https://www.vraagvoordewetenschap.be
The tools in this repo harvest the questions, translate them and upload them to a mysql database.

## Preparations
Install requirements:
```bash
npm install
```

## Harvesting

### Get URLs of all questions
```bash
node index.js
```

### Get details for each question
```bash
node detail.js
```

If you get an exception during the detail run, change the start value on line 6 in **details.js**, to skip already harvested questions.

## Translation

For the translation to work, you need to have a Google Cloud credential file setup and the path in your environmental variables.

### Translate questions and descriptions
```bash
node translate_questions.js
```

### Collect and translate themes
```bash
node translate_themes.js
```

## Export
The export script will created a cleaned json file with all questions, as well as some csv files optimized for machine learning approaches.
```bash
node export.js
```

## Upload
The upload script will insert the questions into a mysql-database. Make sure to setup an **.env** file, with the database credentials (see **.env-sample**).
```bash
node export.js
```

## Note:
Please harvest responsibly. Don't harvest too fast, as this can harm the targeted servers.
