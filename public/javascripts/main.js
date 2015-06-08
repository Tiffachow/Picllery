$(function() {

  "use strict";

  $(".mobile > ul > li").click(alternateOpen);
  function alternateOpen() {
    $(".mobile").css("transform","translateX(0)");
    $(this).click(function(){
      $(".mobile").css("transform","translateX(-120px)")
      $(this).click(alternateOpen);
    });
  }

  $("#recent-link").click(function(){
    $(".section").css("z-index","0");
    $("#recent-pics").css("z-index","1");
  });
  $("#map-link").click(function(){
    $(".section").css("z-index","0");
    $("#map-all").css("z-index","1");
  });
  $("#users-link").click(function(){
    $(".section").css("z-index","0");
    $("aside").css("z-index","1");
  });

});

var piclleryApp = angular.module("piclleryApp", ['ngFileUpload','ui.bootstrap'])
  .controller("mainController", ['$scope', '$http', 'Upload', function($scope, $http, Upload) {

    $scope.logged_in = {username: null};
    $scope.resetDelete = function () {
      $scope.delete = {
        prof: {clicked: false},
        pic: {clicked: false}
      };
    };
    $scope.resetDelete();

    $scope.hideAllPgs = function() {
      // A reset, of sorts
      $(".page").hide();
      $("#picture img").hide();
      $(".error").hide();
      $("#likes, #edit-pic-button, #delete-pic-button, #toggle-hint, #expand").css("display","none");
      $("#new-username, #email").prop("disabled", false);
      $scope.thumb_clicked = false;
      $scope.delete.clicked = false;
    };

    $scope.renderHome = function() {
      $scope.hideAllPgs();
      $(".home").show();
      $scope.getHome();
    };

    $scope.getHome = function() {
      // when landing on the page, get all usernames and show them
      $http.get('/api/home')
        .success(function(data) {
          $scope.users = {
            usernames: data.usernames,
            recent: data.recent,
            popular: data.popular
          };
          var latlng = new google.maps.LatLng(1.0000, 1.0000); // Center of world map
          var mapOptions = {
            zoom: 1,
            center: latlng
          };
          $scope.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
          var marker = {
            recent: [],
            popular: []
          };
          for (var i=0; i < $scope.users.recent.length; i++) {
            $scope.getCoords($scope.users.recent[i].location);
            marker.recent[i] = new google.maps.Marker({
              map: $scope.map,
              position: $scope.myLatLng
            });
          }
          for (var i=0; i < $scope.users.popular.length; i++) {
            $scope.getCoords($scope.users.popular[i].location);
            marker.popular[i] = new google.maps.Marker({
              map: $scope.map,
              position: $scope.myLatLng
            });
          }
          $scope.logged_in.username = data.logged_in_as;
          console.log(data);
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    };

    $scope.renderHome();

    $scope.renderLogin = function() {
      $scope.hideAllPgs();
      $(".login").show();
    };

    $scope.submitLogin = function() {
      var login_data = {
        username: $("#username").val(),
        password: $("#password").val()
      };
      $http.post("/api/login", login_data)
        .success(function(data) {
          if (!data.invalid_username) {
            if (!data.invalid_password) {
              $scope.viewProfile(data.logged_in_as);
              $scope.getPics(data.logged_in_as);
              $scope.logged_in.username = data.logged_in_as;
              $scope.selected_username = data.logged_in_as;
              console.log("Logged in as " + $scope.logged_in.username);
            }
            else {
              $("#password-error").show();
              console.log("Invalid password.");
            }
          }
          else {
            $("#username-error").show();
            console.log("Invalid username.");
          }
        })
        .error(function(data) {
          console.log("Error: " + data);
        });
    };

    $scope.logout = function(username) {
      $http.get("/api/logout/")
      .success(function(data) {
        // Reset stuff!
        $scope.logged_in.username = data.logged_in_as;
        if ($(".home").is(':visible')) {
          $scope.getHome();
        }
        if ($(".profile").is(':visible')) {
          $scope.viewProfile($scope.selected_username);
        }
        if ($(".upload").is(':visible') || $(".update-prof").is(':visible')) {
          $(".upload").hide();
          $(".update-prof").hide();
          $(".home").show();
          $scope.getHome();
        }
      }).error(function(data) {
        console.log("Error: " + data);
      });
    };

    $scope.getPics = function(selected_username) {
      $http.get('/api/pictures/' + selected_username)
        .success(function(data) {
          if (!data.no_pics) {
            $scope.user_pics = data;
            var marker = [];
            for (var i=0; i < $scope.user_pics.length; i++) {
              $scope.getCoords($scope.user_pics[i].location);
              marker[i] = new google.maps.Marker({
                map: $scope.user_map,
                position: $scope.myLatLng
              });
            }
          }
          else {
            console.log("No (public) pics from user.");
            $scope.user_pics = null;
          }
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    };

    $scope.renderCreateProfile = function() {
      $scope.hideAllPgs();
      $(".create-prof").show();
      $("#edit-prof").hide();
      $("#submit-prof").show();
    };

    $scope.submitProfile = function(picFile) {
      console.log("create profile form submitted");
      var password1 = $("#new-password").val();
      var password2 = $("#re-password").val();
      if (password1 === password2) {
        $("#pass-mismatch").hide();
        var prof_data = {
          username: $("#new-username").val(),
          password: $("#new-password").val(),
          first_name: $("#first-name").val(),
          last_name: $("#last-name").val(),
          email: $("#email").val(),
          bio: $("#bio").val()
        };
        $http.post("/api/register", prof_data)
          .success(function(data) {
            if (data.username_taken) {
              $("#username-taken").show();
              console.log("Failed to register because username is taken. Usernames are case-insensitive.");
            }
            else if (data.email_taken) {
              $("#email-taken").show();
              console.log("Failed to register because email is already registered. Emails are case-insensitive.");
            }
            else {
              if (picFile) {
                $scope.uploadPic(picFile, data.logged_in_as, true);
              }
              else {
                $scope.viewProfile(data.logged_in_as);
              }
              $scope.logged_in.username = data.logged_in_as;
              console.log("Registered and created new profile for " + data.logged_in_as);
            }
          })
          .error(function(err) {
            console.log("Error: " + err);
          });
      }
      else {
        $("#pass-mismatch").show();
        console.log("Failed to register; passwords do not match.");
      }
    };

    $scope.showUnfreshProfile = function() {
      $(".page").hide();
      $(".profile").show();
      $("#picture img").show();
    };

    $scope.viewProfileWithPic = function(picture, location, address, private, likes, id, username) {
      $scope.viewProfile(username);
      $scope.displayPic(picture, location, address, private, likes, id, username);
    };

    $scope.viewProfile = function(username) {
      $scope.hideAllPgs();
      $(".profile").show();
      $scope.getMap();
      $scope.selected_username = username;
      $http.get('/api/profile/' + $scope.selected_username)
        .success(function(data) {
          if (data.prof_pic == null || data.prof_pic == '') {
            data.prof_pic = '/images/picllery.png';
            $("#profile-pic").css("background","#fff");
          }
          else {
            $("#profile-pic").css("background","#7554FF");
          }
          $scope.profile = {
            username: data.username,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            prof_pic: data.prof_pic,
            bio: data.bio
          };
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });

      $scope.getPics($scope.selected_username);
    };

    $scope.getMap = function() {
      // Create profile map and set center
      var latlng = new google.maps.LatLng(1.0000, 1.0000);
      var mapOptions = {
        zoom: 1,
        center: latlng
      };
      $scope.user_map = new google.maps.Map(document.getElementById("map-canvas-user"), mapOptions);
    };

    $scope.getCoords = function(location) {
      var coords = location.split(",");
      var lat = coords[0].split(":");
      var lng1 = coords[1].split(":");
      var lng2 = lng1[1].split("}");
      $scope.myLatLng = new google.maps.LatLng(lat[1],lng2[0]);
    };

    $scope.setMarker = function(location, map) {
      $scope.getCoords(location);
      var marker = new google.maps.Marker({
        map: map,
        position: $scope.myLatLng
      });
      map.setCenter($scope.myLatLng);
      map.setZoom(10);
      // for mobile home:
      $(".section").css("z-index","0");
      $("#map-all").css("z-index","1");
    };

    $scope.showLikesAndLink = function(id) {
      $scope.thumb_clicked = id;
    };

    $scope.togglePicOptions = function() {
      var options = $("#edit-pic-button, #delete-pic-button, #likes, #toggle-hint, #expand");
      if (options.css("display") == "none") {
        options.css("display","inline-block");
      } else {
        options.css("display","none");
      }
    };

    $scope.expandPic = function(src) {
      $scope.src = src;
      $scope.expandedPic = $("#expanded-pic");
      $scope.expandedContainer = $(".expand-container");
      if ($scope.expandedPic.css("width") < $scope.expandedContainer.css("width")) {
        var left = ($scope.expandedContainer.css("width") - $scope.expandedPic.css("width")) / 2;
        $scope.expandedPic.css("left", left);
      }
    };

    $scope.closeExpand = function() {
      $scope.src = null;
    };

    $scope.displayPic = function(picture, location, address, priv, likes, id, username) {
      $("#picture img").show().attr("src", picture);
      $("#likes, #edit-pic-button, #delete-pic-button, #toggle-hint, #expand").css("display","inline-block");
      $("#count").html(likes);
      $scope.current_pic = {
        id: id,
        likes: likes,
        user: username,
        picture: picture
      };
      if (priv = 't') {
        priv = true;
      } else {
        priv = false;
      }
      $scope.current_pic.private = priv;
      $scope.setMarker(location, $scope.user_map);
      // TOO SPECIFIC RESULTS FOR IF USER ENTERED A VAGUE ADDRESS WHEN POSTING NEW PIC
      // $scope.getCoords(location);
      // $scope.geocoder.geocode({'latLng': $scope.myLatLng}, function(results, status) {
      //   if (status == google.maps.GeocoderStatus.OK) {
      //     if (results[0]) {
      //       $scope.reverse_geocode_location = results[0].formatted_address;
      //     } else {
      //       $scope.reverse_geocode_location = null;
      //     }
      //   } else {
      //     alert('Geocoder failed due to: ' + status);
      //   }
      // });
      // ALTERNATIVE: Return user's input-ed address as is.
      $scope.reverse_geocode_location = address;
    };

    $scope.addLikes = function(id, likes, username) { // Can only like once
      var data = {
        likes: likes
      };
      $http.put("/api/picture/" + id, data)
        .success(function(data) {
          $scope.getPics(username);
          $("#count").html(data.likes);
          console.log("Like added to pic with id " + id);
        })
        .error(function(data) {
          console.log("Error: " + data);
        });
    };

    $scope.renderEditPic = function() {
      $(".page").hide();
      $(".update-pic").show();
      $scope.isUpload = {upload: false};
      $scope.checkbox = {private: 'f'};
    };

    $scope.updatePic = function() {
      var address = $("#location").val();
      $scope.geocoder.geocode( {'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var geolocation = results[0].geometry.location;
          var new_pic_data = {
            location: geolocation,
            address: address,
            private: $scope.checkbox.private,
            username: $scope.current_pic.user
          };
          console.log($scope.checkbox.private);
          $http.put("/api/picture/" + $scope.current_pic.id, new_pic_data)
            .success(function(data) {
              if (data.not_logged_in || data.not_correct_user) {
                console.log("Not logged in or authorised to edit picture.");
              }
              else {
                console.log("Details updated for picture: " + $scope.current_pic.picture);
                $scope.hideAllPgs();
                $(".profile").show();
                $scope.viewProfile(new_pic_data.username);
              }
            })
            .error(function(data) {
              console.log("Failed to update pic... :( Error: " + error);
            });
        } else {
          alert("Geocode was not successful for the following reason: " + status + ". Please try another address.");
        }
      });
    };

    $scope.deletePic = function() {
      $http.delete("/api/picture/" + $scope.current_pic.user + "/" + $scope.current_pic.id)
      .success(function(data) {
        if (data.not_logged_in || data.not_correct_user) {
          console.log("Not logged in or authorised to edit picture.");
        }
        else {
          console.log("Deleted pic with id: " + $scope.current_pic.id + " for user " + $scope.current_pic.user);
          $scope.hideAllPgs();
          $(".picture img").attr("src","");
          $(".profile").show();
          $scope.viewProfile($scope.current_pic.user);
          $scope.resetDelete();
        }
      })
      .error(function(data) {
        console.log("Error deleting pic: " + data);
      });
      // $scope.delete_clicked = false;
    };

    $scope.renderEditProfile = function() {
      $(".page").hide();
      $(".update-prof").show();
      $("#edit-prof").show();
      $("#submit-prof").hide();
      $("#new-username, #email").prop("disabled", true);
    };

    $scope.editProfile = function(picFile, username, logged_in) {
      console.log("update profile form submitted");
      var password1 = $("#new-password").val();
      var password2 = $("#re-password").val();
      if (password1 === password2) {
        $("#pass-mismatch").hide();
        if (logged_in) { // not creating new profile, upload pic happens here
          if (picFile) { // if new pic submitted, upload it
            $scope.uploadPic(picFile, username, false);
          }
          else { // if no new pic, no need for upload
            var filename = $scope.profile.prof_pic.split("picllery-user-images/");
            if (filename.length > 1) {
              $scope.filename = filename[1]; // so that profile pic stays same if no change
            }
            else {
              $scope.filename = null;
            }
            $scope.submitProfileEdit(username);
          }
        }
        else { // if creating new profile, upload pic happens beforehand
          $scope.submitProfileEdit(username);
        }
      }
      else {
        $("#pass-mismatch").show();
        console.log("Failed to register; passwords do not match.");
      }
    };

    $scope.submitProfileEdit = function(username) {
      var new_data = { // Can't change username or email
        password: $("#new-password").val(),
        first_name: $("#first-name").val(),
        last_name: $("#last-name").val(),
        prof_pic: "https://s3-us-west-2.amazonaws.com/picllery-user-images/" + $scope.filename,
        bio: $("#bio").val()
      };
      if (!$scope.filename) {
        new_data.prof_pic = "";
      }
      $http.put("/api/profile/" + username, new_data)
        .success(function(data) {
          if (data.not_logged_in) {
            console.log("Unauthorised to edit profile. Please log in.")
          }
          else if (data.err) {
            console.log(err);
          }
          else {
            $(".preview").attr("src",""); //reset
            $scope.progress = null;
            $scope.viewProfile(username);
            console.log("Updated profile for " + username);
          }
        })
        .error(function(data) {
          console.log("Error: " + err);
        });
    };

    $scope.deleteProfile = function(username) {
      $http.delete("/api/profile/" + username)
        .success(function(data) {
          if (data.not_logged_in) {
            console.log("Cannot delete profile; not logged in as user.");
          }
          else {
            console.log("Deleted profile for: " + username);
            $scope.logged_in.username = data.logged_in_as;
            $scope.renderHome();
            $scope.resetDelete();
          }
        })
        .error(function(data) {
          console.log("Error: " + err);
        });
    };

    $scope.renderUploadForm = function() {
      $scope.hideAllPgs();
      $(".upload").show();
      $scope.isUpload = {upload: true};
      $scope.progress = null;
      $scope.file = {picFile: null};
      $scope.checkbox = {private: 'f'};
    };

    $scope.file = {picFile: null};
    $scope.policy = "ewogICJleHBpcmF0aW9uIjogIjIwMjUtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogInBpY2xsZXJ5LXVzZXItaW1hZ2VzIn0sCiAgICBbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAiIl0sCiAgICB7ImFjbCI6ICJwdWJsaWMtcmVhZCJ9LAogICAgWyJzdGFydHMtd2l0aCIsICIkQ29udGVudC1UeXBlIiwgIiJdLAogICAgWyJzdGFydHMtd2l0aCIsICIkZmlsZW5hbWUiLCAiIl0sCiAgICBbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwgMCwgNTI0Mjg4MDAwXQogIF0KfQ==";
    $scope.signature = "G4CtuC9xOrWVumnNbMIUxkP5K0I=";

    $scope.uploadPic = function (files, username, submitFirstProfPic) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var identifier, filename;
          var d = new Date();
          var t = d.getTime();
          identifier = username + "/" + t;
          filename = identifier + "/" + file.name;
          $scope.upload = Upload.upload({
              url: 'https://picllery-user-images.s3.amazonaws.com/',
              method: 'POST',
              fields : {
                key: filename,
                AWSAccessKeyId: "AKIAIOGEX3T2DE2FRA4Q",
                acl: 'public-read',
                policy: $scope.policy,
                signature: $scope.signature,
                "Content-Type": file.type != '' ? file.type : 'application/octet-stream',
                filename: filename // this is needed for Flash polyfill IE8-9
              },
              file: file,
          }).progress(function (evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              $scope.progress = progressPercentage + '% ' + evt.config.file.name;
              console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
          }).success(function (data, status, headers, config) {
              console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
              $scope.filename = filename;
              $scope.progress = null;
              $(".preview").attr("src",""); //reset
              if (submitFirstProfPic == true) { // aka when creating new profile
                $scope.editProfile('', username);
                $scope.viewProfile(username);
              }
              else if (submitFirstProfPic == false) { // aka when editing prof pic
                $scope.submitProfileEdit(username);
              }
              else {
                $scope.postPic(filename, username);
              }
          });
        }
      }
    };

    $scope.cancelUpload = function() {
      if ($scope.upload) {
        $scope.upload.abort(); // In case user was uploading, cancel that.
      };
      $scope.viewProfile($scope.logged_in.username);
    };

    $scope.geocoder = new google.maps.Geocoder();

    // Post new pic for existing user
    $scope.postPic = function(filename, username) {
      var address = $("#location").val();
      $scope.geocoder.geocode( {'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var geolocation = results[0].geometry.location;
          var new_pic_data = {
            picture: "https://s3-us-west-2.amazonaws.com/picllery-user-images/" + filename,
            location: geolocation,
            address: address,
            private: $scope.checkbox.private
          };
          $http.post("/api/picture/" + username, new_pic_data)
            .success(function(data) {
              console.log("Posted new pic for " + username);
              $scope.hideAllPgs();
              $(".profile").show();
              $("input#file, input#location").val(''); // reset fields
              $scope.viewProfile(username);
            })
            .error(function(data) {
              console.log("Failed to post new pic... :( Error: " + error);
            });
        } else {
          alert("Geocode was not successful for the following reason: " + status + ". Please try another address.");
        }
      });
    };
  }]);