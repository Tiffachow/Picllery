var express = require('express');
var multer = require('multer'); 
var pg = require('pg');
var conString = "postgres://tiffachow@localhost:5432/picllery";
var router = express.Router();
router.use(multer()); // for parsing multipart/form-data


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Picllery' });
});

/* POST new profile. */
router.post('/api/register', function(req, res) {
  console.log(req.body["first-name"]);
  res.send();
});

/* POST to login. */
router.post('/api/login', function(req, res) {
  res.send();
});

/* GET profile. */
router.get('/api/profile', function(req, res) {
  res.send();
});

module.exports = router;