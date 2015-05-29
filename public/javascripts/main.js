$(function() {

"use strict";

var usernames,
recent,
username,
first_name,
last_name,
email,
prof_pic,
bio;

var pic_wid = $(".pic").width();
$(".pic").css({"height": pic_wid + "px"});

$(".pic").hover(
	function() {
		$(this).css("opacity","0.7");
	},
	function() {
		$(this).css("opacity","1");
	}
);

//============================
function hideAllPgs() {
	$(".page").hide();
}

//============================

function renderHomePg() {
	hideAllPgs();
  $(".home").show();
  $.ajax({
    url: "/api/home",
    type: "GET",
  }).done(function(data){
    usernames = data.usernames;
    recent = data.recent;
    console.log(data.usernames[0].username);
  }).fail(function(a, b, c) {
    console.log("Failed to retrieve data :(");
    console.log(a, b, c);
  });
}

function renderCreateProfile() {
	hideAllPgs();
	$(".create-prof").show();
	$("#pass-mismatch, #username-taken").hide();
	createProfile();
}

function createProfile() {
	$("#create-prof-form").on("submit", function() {
		event.preventDefault();
		console.log("create profile form submitted");
		var password1 = $("#new-password").val();
		var password2 = $("#re-password").val();
		if (password1 === password2) {
			$("#pass-mismatch").hide();
			$.ajax({
        url: "/api/register",
        type: "POST",
        data: $("#create-prof-form").serialize()
      }).done(function(data){
        if (data.username_taken) {
            $("#username-taken").show();
        }
        else {
            $("#username-taken").hide();
            hideAllPgs();
            $(".profile").show();
            username = data.username;
            first_name = data.first_name;
            last_name = data.last_name;
            email = data.email;
            prof_pic = data.prof_pic;
            bio = data.bio;
            console.log("Registered and created new profile for: " + data.username);
        }
      }).fail(function(a, b, c) {
        console.log("Failed to post/register... :(");
        console.log(a, b, c);
      });
  	}
  	else {
  		$("#pass-mismatch").show();
  		console.log("Failed to register; passwords do not match.");
  	}
	});
}

function renderLoginPg() {
	hideAllPgs();
	$(".login").show();
}

function renderViewProfile() {
	hideAllPgs();
  $(".profile").show();
}

function uploadNewPic() {
	hideAllPgs();
}
//============================

//============================
renderHomePg();
$(".user").click(renderViewProfile);
$("#title").click(renderHomePg);
$("#login").click(renderLoginPg);
$("#create-prof").click(renderCreateProfile);

});