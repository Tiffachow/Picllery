var express = require('express');
var multer = require('multer'); 
var pg = require('pg');
var conString = "postgres://tiffachow@localhost:5432/picllery";
var router = express.Router();
router.use(multer()); // for parsing multipart/form-data
// ================================================================================

/* GET home page. */
router.get('/', function(req, res, next) {
  var results_usernames = [];
  var results_recent = [];

  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > Select Username from ALL Users
    var username_query = client.query("SELECT username FROM users ORDER BY username ASC");
    // Stream results back one row at a time
    username_query.on('row', function(row) {
        results_usernames.push(row);
    });
    // After all data is returned, close connection and return results
    username_query.on('end', function() {
      client.end();
      return res.json(results_usernames);
    });

    // SQL Query > Select Recent Pics Data from ALL Pics
    var recent_query = client.query("SELECT * FROM pics ORDER BY id DESC LIMIT 60");
    // Stream results back one row at a time
    recent_query.on('row', function(row) {
        results_recent.push(row);
    });
    // After all data is returned, close connection and return results
    recent_query.on('end', function() {
      client.end();
      return res.json(results_recent);
    });

    // Handle Errors
    if(err) {
      console.log(err);
    }
  });
  // res.render('index');
  res.end();
});

// ================================================================================

/* POST new profile. */
router.post('/api/register', function(req, res) {
  var data = {
    username: req.body["username"],
    password: req.body["password"],
    first_name: req.body["first-name"],
    last_name: req.body["last-name"],
    email: req.body["email"],
    prof_pic: req.body["prof-pic"],
    bio: req.body["bio"]
  };
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > Insert Data for New User
    client.query({
      text: "INSERT INTO users(username, password, first_name, last_name, email, prof_pic, bio) values($1, $2, $3, $4, $5, $6, $7)",
      values: [data.username, data.password, data.first_name, data.last_name, data.email, data.prof_pic, data.bio]
    });
    // SQL Query > Select Data (except password) from New User
    var query = client.query("SELECT username, first_name, last_name, email, prof_pic, bio FROM users WHERE username = $1", [data.username], function(err, result){
      // Handle errors for query
      if (err) {
        console.log(err);
      }
      // After all data is returned, return results
      query.on('end', function() {
        client.end();
        return res.json(result.rows[0]);
      });
    });

    // Handle Errors for connection
    if(err) {
      console.log(err);
    }
  });
  res.end();
});

// ================================================================================

/* POST to login. */
router.post('/api/login', function(req, res) {
  var data = {
    username: req.body["username"],
    password: req.body["password"]
  };
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > Select Password from Existing User
    var pass_query = client.query("SELECT password FROM users WHERE username = $1", [data.username], function(err, result) {
      // Handle errors when can't select password from username
      if (err) {
        console.log(err);
      }
      // If passwords match, select and return all user data but password
      if (data.password == result) {
        // SQL Query > Select All Data but Password from Existing User
        var query = client.query("SELECT username, first_name, last_name, email, prof_pic, bio FROM users WHERE username = $1", [data.username], function(err, result) {
          // Handle errors for query
          if (err) {
            console.log(err);
          }
          // After all data is returned, return results
          query.on('end', function() {
            return res.json(result.rows[0]);
          });
        });
      };
      // Close connection
      client.end();
    });
    
    // Handle Errors for connecting to client
    if(err) {
      console.log(err);
    }
  });
  res.end();
});

// ================================================================================

/* GET profile. */
router.get('/api/profile', function(req, res) {
  var results = [];
  var username = req.params["username"];
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > Select Data from New User
    var query = client.query("SELECT username, first_name, last_name, email, prof_pic, bio FROM users WHERE username = $1", [username], function(err, result){
      // Handle errors for query
      if (err) {
        console.log(err);
      }
      // After all data is returned, return results
      query.on('end', function() {
        client.end();
        return res.json(result.rows[0]);
      });
    });
    
    // Handle Errors for connection
    if(err) {
      console.log(err);
    }
  });
  res.end();
});

// ================================================================================

/* UPDATE profile. */
router.put('/api/profile', function(req, res) {
  res.end();
});

// ================================================================================

/* UPDATE picture. */
router.put('/api/picture', function(req, res) {
  res.end();
});

// ================================================================================
module.exports = router;