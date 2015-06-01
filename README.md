# Picllery
A single page web app that allows you to: 
* upload and display photos 
* with locations 
* in a public or private gallery 
* on your user profile.

##To Run:
Make sure you have Node and npm installed.
Install, setup postgreSQL if you haven't already:
```sh
    $ brew install postgresql
    $ initdb /usr/local/var/postgres -E utf8
    $ ln -sfv /usr/local/opt/postgresql/*.plist ~/Library/LaunchAgents
```
Create database named "picllery": `$ createdb picllery`  
Clone the repo: `$ git clone git@github.com:Tiffachow/Picllery.git`  
Install the app and setup tables: `$ npm install`  
Start the server: `$ npm start`  
View in your browser at `http://localhost:3000`

##Tech
* API / Web Framework: **NodeJS / Express.js**
* Database: **PostgreSQL**
* Authentication Middleware: Mozilla's **client-sessions**
* Image Storage: **Amazon S3**
* MV\* JS Framework: **AngularJS**
* Styles Preprocessor: **LESS**
* Responsive Framework: **Bootstrap**

##Features
* User Profiles
* Private and Public Pics & Gallery Options
* Picture Locations, Pin Map
* Picture Likes

###Todo
* Add Map API
* AWS Image Storage
* Hash Passwords
* Angular 

recently done: added authentication, updated API, updated readme, added angular directives
recently done: added mobile nav, added more responsiveness to pgs
recently done: added API routes for delete profile, update profile, post new picture, update picture, delete picture, updated angular ajax requests