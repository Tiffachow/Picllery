$(function() {

"use strict";

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
}

function renderCreateProfile() {
	hideAllPgs();
	$(".create-prof").show();
	$("#pass-mismatch").hide();
	createProfile();
}

function createProfile() {
	$("#create-prof-form").on("submit", function() {
		event.preventDefault();
		console.log("submitted");
		var password1 = $("#new-password").val();
		var password2 = $("#re-password").val();
		if (password1 == password2) {
			$("#pass-mismatch").hide();
			$.ajax({
	            url: "/api/register",
	            type: "POST",
	            data: $("#create-prof-form").serialize()
	        }).done(function(data){
	            if (data.username_taken) {
	                // $("h1#error").show();
	            }
	            else {
	                // $("h1#error").hide();
	                // renderViewProfile(data.username);
	                // updateNavLoginStatus(data);
	                // console.log("Posted and created new profile for: " + data.username);
	            }
	        }).fail(function(a, b, c) {
	            console.log("Failed to post/register... :(");
	            console.log(a, b, c);
	        });
    	}
    	else {
    		$("#pass-mismatch").show();
    		console.log("failed");
    	}
	});
}

function renderLoginPg() {
	hideAllPgs();
	$(".login").show();
}

function renderViewProfile() {
	hideAllPgs();
}

function uploadNewPic() {
	hideAllPgs();
}

//============================
renderHomePg();
$(".user").click(renderViewProfile);
$("#title").click(renderHomePg);
$("#login").click(renderLoginPg);
$("#create-prof").click(renderCreateProfile);

});