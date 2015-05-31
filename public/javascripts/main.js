$(function() {

"use strict";

var usernames,
recent;
// username,
// first_name,
// last_name,
// email,
// prof_pic,
// bio;

$('a').smoothScroll();

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

//============================
function hideAllPgs() {
  $(".page").hide();
  $("#picture img").hide();
}

//============================

function renderHomePg() {
  hideAllPgs();
  $(".home").show();
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
            $("#picture img").hide();
            // username = data.username;
            // first_name = data.first_name;
            // last_name = data.last_name;
            // email = data.email;
            // prof_pic = data.prof_pic;
            // bio = data.bio;
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

function uploadNewPic() {
	hideAllPgs();
}
//============================

//============================
renderHomePg();
$("#title").click(renderHomePg);
$("#login").click(renderLoginPg);
$("#create-prof").click(renderCreateProfile);

});