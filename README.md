#Picllery
A **single page**, mobile **responsive** web app that allows you to:
* **upload** and **display** photos
* with **geolocations** & **likes**
* in a **public** or **private** gallery
* on your **user profile**.

[Demo @ picllery.heartso.me](http://picllery.heartso.me)

##To Run:
1. Make sure you have Node and npm installed.
2. Install, setup postgreSQL if you haven't already:
```sh
    $ brew install postgresql
    $ initdb /usr/local/var/postgres -E utf8
    $ ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
```
or if on ubuntu:
```sh
    $ sudo apt-get install postgresql postgresql-contrib
```
user: postgres, password: password
3. Create database named "picllery": `$ createdb picllery`
4. Clone the repo:
```
    $ git clone git@github.com:Tiffachow/Picllery.git picllery
    $ cd picllery
```
5. Install the app and setup tables: `$ npm install`
6. Start the server: `$ npm start`
7. View in your browser at `http://localhost:9000`

##Tech
* API / Web Framework: **Node.js / [Express.js](http://expressjs.com/)**
* Database: [**PostgreSQL**](http://www.postgresql.org/)
* Authentication Middleware: Mozilla's [**client-sessions**](https://github.com/mozilla/node-client-sessions)
* Image Storage: [**Amazon S3**](http://aws.amazon.com/s3/)
* MV\* JS Framework: [**AngularJS**](https://angularjs.org/)
* File Upload: [**ng-file-upload**](https://github.com/danialfarid/ng-file-upload) library by Danial Farid
* Password Hashing: [**bcrypt**](https://www.npmjs.com/package/bcrypt) library
* Styles Preprocessor: [**LESS**](http://lesscss.org/)
* Responsive Framework: [**Bootstrap**](http://getbootstrap.com/)

##Features
* CRUD User Profiles with Image Gallery
* CRUD Pics with Private and Public Options
* Picture Locations, Pin Maps
* Picture Likes

###Todo
* Crop Img Library

###Recently Done
* added authentication, updated API, updated readme, added angular directives
* added mobile nav, added more responsiveness to pgs
* added API routes for delete profile, update profile, post new picture, update picture, delete  picture, updated angular ajax requests
* updated profile routes, templated and styled profile pg, updated edit and delete profile requests and routes, added upload picture form, request and route, added map with pins to home pg
* styled profile pg, added map to profile, revised post profile route and success callback, added login/logout logic and route, fixed edit and delete profile routes, made header more responsive, edited db column constraints, fixed login route
* changed home & profile styling, used angular file upload library with post upload to Amazon S3, wrote request to save pics to db, rewrote submit profile and edit profile requests and routes to accomodate library
* fixed bugs with logout, fixed map markers and positioning
* added likes functionality, update and delete picture requests and routes and angular logic, added view likes and pics functionality on homepg, cancel option on forms
* updated cancel functions for different forms, added sure? prompt before deletes, added preview and prof pic placeholder imgs, added pic option toggling for better viewing, hashed passwords with bcrypt library, simplified login and create profile routes and responses
* simplified edit profile route and response, cleaned up cancel functions, updated delete functions, added pic expansion option, replaced private input checkbox with angular bootstrap ui button-checkbox, fixed create & edit prof bugs when no prof pic inputted
* moved module and controller code to main.js file