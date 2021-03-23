const fs = require('fs');
const mysql = require('mysql');
const Math = require('mathjs');

require('dotenv').config();

const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
const questionsProfanity = fs.readFileSync('tmp/questions-profanity.json-nd', 'utf8').split('\n').map((line) => JSON.parse(line));
const descriptionsProfanity = fs.readFileSync('tmp/descriptions-profanity.json-nd', 'utf8').split('\n').map((line) => JSON.parse(line));
const questionsSentiment = fs.readFileSync('tmp/questions-sentiment.json-nd', 'utf8').split('\n').map((line) => JSON.parse(line));
const descriptionsSentiment = fs.readFileSync('tmp/descriptions-sentiment.json-nd', 'utf8').split('\n').map((line) => JSON.parse(line));

// sentiment_summary
// sentiment_all

const rows = [];

const summary = (d) => {
  if (d.length > 0) {
    return {
      mean: Math.mean(d),
      max: Math.max(d),
      min: Math.min(d)
    };
  } else {
    return {
      mean: false,
      max: false,
      min: false
    };
  }
};

const summarize = (d) => {
  const values = {
    neg: [],
    neu: [],
    pos: [],
    compound: []
  }
  
  d.forEach((v) => {
    Object.keys(v).forEach((key) => {
      values[key].push(v[key]);
    });
  });

  return {
    neg: summary(values.neg),
    neu: summary(values.neu),
    pos: summary(values.pos),
    compound: summary(values.compound)
  }
};

questions.forEach((q, qi) => {
  rows.push([
    mysql.escape(q.id),
    mysql.escape(q.question),
    mysql.escape(q.question_en[0]),
    mysql.escape((q.description.length > 0) ? q.description : q.description_alt),
    mysql.escape((q.description.length > 0) ? q.description_en[0] : ((q.description_alt.length > 0) ? q.description_alt_en[0] : '')),
    (!questionsProfanity[qi].profanityfilter) ? 'FALSE' : 'TRUE',
    (!descriptionsProfanity[qi].profanityfilter) ? 'FALSE' : 'TRUE',
    mysql.escape(questionsProfanity[qi].sonar.top_class),
    mysql.escape(JSON.stringify(questionsProfanity[qi].sonar.classes)),
    (descriptionsProfanity[qi].sonar) ? mysql.escape(descriptionsProfanity[qi].sonar.top_class) : null,
    (descriptionsProfanity[qi].sonar) ? mysql.escape(JSON.stringify(descriptionsProfanity[qi].sonar.classes)) : null,
    mysql.escape(JSON.stringify(summarize(questionsSentiment[qi]))),
    mysql.escape(JSON.stringify(questionsSentiment[qi])),
    mysql.escape(JSON.stringify(summarize(descriptionsSentiment[qi]))),
    mysql.escape(JSON.stringify(descriptionsSentiment[qi]))
  ]);
});

const connection = mysql.createConnection({
  host: process.env.MYSQL_SERVER,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

connection.connect();

const cols = [
  'original_id',
  'question',
  'question_en',
  'description',
  'description_en',
  'profanityfilter',
  'description_profanityfilter',
  'sonar_top',
  'sonar_all',
  'description_sonar_top',
  'description_sonar_all',
  'sentiment_summary',
  'sentiment_all',
  'description_sentiment_summary',
  'description_sentiment_all'
];

const insert = () => {
  connection.query(`INSERT INTO questions (${cols.join(',')}) VALUES ${rows.map((row) => `(${row.map((r) => {
    if (!r || r === '') {
      return 'NULL';
    }
    return r;
  }).join(',')})`).join(',')}`,
  (error) => {
    if (error) {
      fs.writeFileSync('./tmp/error.json', JSON.stringify(error), 'utf8');
      connection.end();
    } else {
      connection.end();
    }
  }
);
}

connection.query(`TRUNCATE questions`,
  (error) => {
    insert();
    if (error) {
      fs.writeFileSync('./tmp/error.json', JSON.stringify(error), 'utf8');
    }
  }
);