var express = require('express');
var multer = require('multer'); 
var pg = require('pg');
var conString = "postgres://localhost:5432/picllery";
var router = express.Router();
router.use(multer()); // for parsing multipart/form-data
// ================================================================================



// router.use(function(req, res, next) {
//   if (!req.user) {
//     res.json({logged_in: false});
//     next();
//   } else {
//     next();
//   }
// });

/* GET home page. */
router.get('/api/home', function(req, res) {
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

    // SQL Query > Select Recent Public Pics Data from ALL Pics
    var recent_query = client.query("SELECT * FROM pics WHERE private = 'f' ORDER BY id DESC LIMIT 60");
    // Stream results back one row at a time
    recent_query.on('row', function(row) {
      results_recent.push(row);
    });
    // After all data is returned, close connection and return results
    username_query.on('end', function() {
      recent_query.on('end', function() {
        client.end();
        return res.json({usernames: results_usernames, recent: results_recent});
      });
    });

    // Handle Errors
    if(err) {
      console.log(err);
    }
  });
  return;
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
    // Check if username exists, if not, create a new user in db with input data
    client.query("SELECT username FROM users WHERE username = $1", [data.username], function(err, result){
      if (err) {
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
      }
      else {
        return res.json({username_taken: true});
      }
    });

    // Handle Errors for connection
    if(err) {
      console.log(err);
    }
  });
  return;
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
        console.log(err + " Invalid username or password.");
      }
      // If passwords match, select and return all user data but password
      if (data.password === result) {
        // SQL Query > Select All Data but Password from Existing User
        var query = client.query("SELECT username, first_name, last_name, email, prof_pic, bio FROM users WHERE username = $1", [data.username], function(err, result) {
          // Handle errors for query
          if (err) {
            console.log(err);
          }
          // After all data is returned, return results
          query.on('end', function() {
            var user = result.rows[0];
            // Stores user info by setting cookie
            // Setting a property will automatically cause a Set-Cookie response to be sent
            req.session.user = user;
            req.user = user;
            // Delete password from cookie
            delete req.session.user.password;
            return res.json(user);
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
  return;
});

// ================================================================================

/* GET profile. */
router.get('/api/profile/<username>', function(req, res) {
  var username = req.params["username"];
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > Select Data from User
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
  return;
});

// ================================================================================

/* GET pictures. */
router.get('/api/pictures', function(req, res) {
  var pic_results = [];
  var own_pics_results = [];
  var username = req.params["username"];
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > Select All Pics, Private and Public, from Logged In User
    if (req.session && req.session.user && username === req.session.user.username) {
      var own_pics_query = client.query("SELECT * FROM pics WHERE username = $1 ORDER BY id DESC", [req.session.user.username]);
      // Stream results back one row at a time
      own_pics_query.on('row', function(row) {
        own_pics_results.push(row);
      });
      own_pics_query.on('end', function() {
        return res.json(own_pics_results);
      });
    }
    else {
      // SQL Query > Select All Public Pics from User
      var pics_query = client.query("SELECT * FROM pics WHERE username = $1 AND private = 'f' ORDER BY id DESC", [username]);
      // Stream results back one row at a time
      pics_query.on('row', function(row) {
        pic_results.push(row);
      });
      pics_query.on('end', function() {
        return res.json({pic_results: pic_results});
      });
    }

    client.end();
    // Handle Errors for connection
    if(err) {
      console.log(err);
    }
  });
  return;
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