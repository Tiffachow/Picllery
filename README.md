#Picllery
A single page web app that allows you to:
* upload and display photos
* with locations
* in a public or private gallery
* on your user profile.

##To Run:
1. Make sure you have Node and npm installed.
2. Install, setup postgreSQL if you haven't already:
```sh
    $ brew install postgresql
    $ initdb /usr/local/var/postgres -E utf8
    $ ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
```
3. Create database named "picllery": `$ createdb picllery`
4. Clone the repo: `$ git clone git@github.com:Tiffachow/Picllery.git`
5. Install the app and setup tables: `$ npm install`
6. Start the server: `$ npm start`
7. View in your browser at `http://localhost:3000`

##Tech
* API / Web Framework: **Node.js / [Express.js](http://expressjs.com/)**
* Database: [**PostgreSQL**](http://www.postgresql.org/)
* Authentication Middleware: Mozilla's [**client-sessions**](https://github.com/mozilla/node-client-sessions)
* Image Storage: [**Amazon S3**](http://aws.amazon.com/s3/)
* MV\* JS Framework: [**AngularJS**](https://angularjs.org/)
* File Upload: [**ng-file-upload**](https://github.com/danialfarid/ng-file-upload) library by Danial Farid
* Styles Preprocessor: [**LESS**](http://lesscss.org/)
* Responsive Framework: [**Bootstrap**](http://getbootstrap.com/)

##Features
* User Profiles
* Private and Public Pics & Gallery Options
* Picture Locations, Pin Map
* Picture Likes

###Todo
* Google Maps API
* Likes Routes
* Hash Passwords
* Caching
* Angular

* recently done: added authentication, updated API, updated readme, added angular directives
* recently done: added mobile nav, added more responsiveness to pgs
* recently done: added API routes for delete profile, update profile, post new picture, update picture, delete  picture, updated angular ajax requests
* recently done: updated profile routes, templated and styled profile pg, updated edit and delete profile requests and routes, added upload picture form, request and route, added map with pins to home pg
* recently done: styled profile pg, added map to profile, revised post profile route and success callback, added login/logout logic and route, fixed edit and delete profile routes, made header more responsive, edited db column constraints, fixed login route
* recently done: changed home & profile styling, used angular file upload library with post upload to Amazon S3, wrote request to save pics to db, rewrote submit profile and edit profile requests and routes to accomodate library