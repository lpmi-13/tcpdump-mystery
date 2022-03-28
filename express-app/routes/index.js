var express = require('express');
var router = express.Router();

var Pool = require('pg').Pool;
var pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});


/* GET home page. */
router.get('/', function(req, res, next) {
  pool.query('SELECT greeting_text FROM greeting WHERE greeting_id = 1;', (error, results) => {
    if (error) {
       throw error;
    }
    const timeNow = `the time is now ${new Date().toLocaleString()}`;
    const greeting = results.rows[0].greeting_text;
    res.render('index', { title: greeting, time: timeNow });
  })
});

module.exports = router;
