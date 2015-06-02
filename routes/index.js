var express = require('express');
var multer = require('multer');
var pg = require('pg');
var conString = "postgres://localhost:5432/picllery";
var router = express.Router();
router.use(multer()); // for parsing multipart/form-data
// ================================================================================

/* GET home page. */
router.get('/api/home', function(req, res) {
  var results_usernames = [];
  var results_recent = [];
  var results_popular = [];

  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > Select Username from ALL Users
    var username_query = client.query("SELECT username FROM users ORDER BY LOWER(username) ASC");
    // Stream results back one row at a time
    username_query.on('row', function(row) {
      results_usernames.push(row);
    });

    // SQL Query > Select Recent Public Pics Data from ALL Pics
    var recent_query = client.query("SELECT * FROM pics WHERE private = 'f' ORDER BY id DESC LIMIT 30");
    // Stream results back one row at a time
    recent_query.on('row', function(row) {
      results_recent.push(row);
    });

    // SQL Query > Select Popular Public Pics Data from ALL Pics
    var popular_query = client.query("SELECT * FROM pics WHERE private = 'f' ORDER BY likes DESC LIMIT 30");
    // Stream results back one row at a time
    popular_query.on('row', function(row) {
      results_popular.push(row);
    });

    // After all data is returned, close connection and return results
    username_query.on('end', function() {
      recent_query.on('end', function() {
        popular_query.on('end', function() {
          client.end();
          var logged_in_as;
          // if logged in, set the username that's logged in
          if (req.session && req.session.user) {
            logged_in_as = req.session.user.username;
          } else {
            logged_in_as = null;
          }
          return res.json({usernames: results_usernames, recent: results_recent, popular: results_popular, logged_in_as: logged_in_as});
        });
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

/* POST to login. */
router.post('/api/login', function(req, res) {
  var data = {
    username: req.body["username"],
    password: req.body["password"]
  };
  console.log(data.username + data.password);
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > Select Password from Existing User
    client.query("SELECT password FROM users WHERE username = $1", [data.username], function(err, result) {
      // Handle query error: there's no such username in db
      if (err || result.rows.length == 0) {
        return res.json({invalid_password: true, invalid_username: true});
      }
      // If passwords match, select and return all user data but password
      if (data.password === result.rows[0].password) {
        // SQL Query > Select All Data but Password from Existing User
        var query = client.query("SELECT username, first_name, last_name, email, prof_pic, bio FROM users WHERE username = $1", [data.username], function(err, result) {
          // Handle errors for query
          if (err) {
            console.log(err);
          }
          // After all data is returned, return results
          query.on('end', function() {
            // Close connection
            client.end();
            var user = result.rows[0];
            // Stores user info by setting cookie
            // Setting a property will automatically cause a Set-Cookie response to be sent
            // Start user session
            req.session.user = user;
            return res.json({user: user, logged_in_as: req.session.user.username});
          });
        });
      }
      else {
        client.end();
        return res.json({invalid_password: true});
      }
    });

    // Handle Errors for connecting to client
    if(err) {
      console.log(err);
    }
  });
  return;
});

// ================================================================================

/* GET logout. */
router.get('/api/logout/', function(req, res) {
  // End user session
  delete req.session.user;
  return res.json({logged_in_as: null});
});

// ================================================================================

/* POST new profile. */
router.post('/api/register', function(req, res) {
  var data = {
    username: req.body["username"],
    password: req.body["password"],
    first_name: req.body["first_name"],
    last_name: req.body["last_name"],
    email: req.body["email"],
    prof_pic: req.body["prof_pic"],
    bio: req.body["bio"]
  };
  console.log(data);
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // Check if username exists, if not, check if email exists. Ensure that both are case insensitive.
    client.query("SELECT username FROM users WHERE LOWER(username) = LOWER($1)", [data.username], function(err, result){
      if (result.rows.length == 0) {
        // If neither exist, create a new user in db with input data
        client.query("SELECT username FROM users WHERE LOWER(email) = LOWER($1)", [data.email], function(err, result){
          if (result.rows.length == 0) {
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
                var user = result.rows[0];
                // Start user session
                req.session.user = user;
                return res.json({user:user, logged_in_as: req.session.user.username});
              });
            });
          }
          else {
            return res.json({email_taken: true});
          }
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

/* GET profile. */
router.get('/api/profile/:username', function(req, res) {
  var username = req.params["username"];
  console.log(username);
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

/* UPDATE profile. */
router.put('/api/profile/:username', function(req, res) {
  var username = req.params["username"];
  var data = {
    password: req.body["password"],
    first_name: req.body["first_name"],
    last_name: req.body["last_name"],
    prof_pic: req.body["prof_pic"],
    bio: req.body["bio"]
  };
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // Check if logged in
    if (req.session && req.session.user && username === req.session.user.username) {
      // Update user data
      client.query({
        text: "UPDATE users SET password=$1, first_name=$2, last_name=$3, prof_pic=$4, bio=$5 WHERE username = $6",
        values: [data.password, data.first_name, data.last_name, data.prof_pic, data.bio, username]
      }, function(err, result){
        if (err) {
          // Handle errors for query
          console.log(err);
        }
        else {
          client.query("SELECT username, first_name, last_name, email, prof_pic, bio from users WHERE username = $1", [username], function(err, result){
            var user = result.rows[0];
            req.session.user = user;
            return res.json(user);
          });
        }
      });
    }
    else {
      return res.json({not_logged_in: true});
    }

    // Handle Errors for connection
    if(err) {
      console.log(err);
    }
  });
  return;
});

// ================================================================================

/* DELETE profile. */
router.delete('/api/profile/:username', function(req, res) {
  var username = req.params["username"];
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // Check if logged in
    if (req.session && req.session.user && username === req.session.user.username) {
      // SQL Query > Delete all user data including pics
      user_delete = client.query("DELETE FROM users WHERE username = $1", [username], function(err, result){
        // Handle errors for query
        if (err) {
          console.log(err);
        }
        // After all data is returned, return results
        user_delete.on('end', function() {
          pics_delete = client.query("DELETE FROM pics WHERE username = $1", [username], function(err, result){
            // Handle errors for query
            if (err) {
              console.log(err);
            }
            pics_delete.on('end', function() {
              client.end();
              // End session
              delete req.session.user;
              return res.json({logged_in_as: null});
            });
          });
        });
      });
    }
    else {
      return res.json({not_logged_in: true});
    }

    // Handle Errors for connection
    if(err) {
      console.log(err);
    }
  });
  return;
});

// ================================================================================

/* POST new picture. */
router.post('/api/picture/:username', function(req, res) {
  var priv;
  if (req.body["private"] == "checked") {
    priv = "t";
  }
  else {
    priv = "f";
  }
  var data = {
    username: req.params["username"],
    picture: req.body["picture"],
    location: req.body["location"],
    private: priv,
  };
  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {
    // SQL Query > If Logged In,
    if (req.session && req.session.user && data.username === req.session.user.username) {
      client.query("INSERT INTO pics(username, picture, location, likes, private) values($1, $2, $3, '0', $4)", [data.username, data.picture, data.location, data.private]);
    }
    else {
      return res.json({logged_in: false});
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

/* GET pictures. */
router.get('/api/pictures/:username', function(req, res) {
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
        client.end();
        if (own_pics_results.length == 0) {
          return res.json({no_pics: true});
        }
        else {
          return res.json(own_pics_results);
        }
      });
      own_pics_query.on('error', function(error) {
        console.log(error);
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
        client.end();
        if (pic_results.length == 0) {
          return res.json({no_pics: true});
        }
        else {
          return res.json(pic_results);
        }
      });
      pics_query.on('error', function(error) {
        console.log(error);
      });

    }

    // Handle Errors for connection
    if(err) {
      console.log(err);
    }
  });
  return;
});

// ================================================================================

/* UPDATE picture. */
router.put('/api/picture/:id', function(req, res) {
  var id = req.params["id"];
  res.end();
});

// ================================================================================

/* DELETE picture. */
router.delete('/api/picture/:id', function(req, res) {
  var id = req.params["id"];
  res.end();
});

// ================================================================================
module.exports = router;