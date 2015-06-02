var pg = require('pg');
// var conString = "postgres://username:password@localhost/database";
var conString = "postgres://localhost:5432/picllery";

pg.connect(conString, function(err, client, done) {

  if (err) {
    return console.error('error fetching client from pool', err);
  }
  var usersTableQuery = "CREATE TABLE users(id SERIAL PRIMARY KEY, username VARCHAR(30) UNIQUE NOT NULL, password VARCHAR(50) NOT NULL, first_name VARCHAR(50) NOT NULL, last_name VARCHAR(50) NOT NULL, email VARCHAR(50) UNIQUE NOT NULL, prof_pic VARCHAR(100), bio text);";
  var picsTableQuery = "CREATE TABLE pics(id SERIAL PRIMARY KEY, username VARCHAR(30) NOT NULL, picture VARCHAR(100) NOT NULL, location VARCHAR(50), likes SMALLINT, private BOOL)";
  
  client.query(usersTableQuery + picsTableQuery, function(err, result) {
    done();
    if (err) {
      return console.error('error running queries', err);
    }
  });
});