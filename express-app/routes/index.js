const express = require('express');
const router = express.Router();

const randomWait = () => {
  return Math.floor(Math.random()*750+1)
}

/* GET home page. */
router.get('/', function(req, res, next) {
    setTimeout(() => {
      const timeNow = `the time is now ${new Date().toLocaleString()}`;
      const greeting = 'Thanks for loading this page!';
      res.render('index', { title: greeting, time: timeNow });
  }, randomWait());
});

module.exports = router;
