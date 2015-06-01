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
  $(".error").hide();
  $("#picture img").hide();
}

//============================

function renderHomePg() {
  hideAllPgs();
  $(".home").show();
  var latlng = new google.maps.LatLng(40.712784, -74.005941);
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

function renderCreateProfile() {
  hideAllPgs();
  $(".create-prof").show();
  $("#edit-prof").hide();
  $("#submit-prof").show();
}

function renderEditProfile() {
  hideAllPgs();
  $(".update-prof").show();
  $("#edit-prof").show();
  $("#submit-prof").hide();
}

function renderLoginPg() {
	hideAllPgs();
	$(".login").show();
  submitLogin();
}

function renderUploadPg() {
	hideAllPgs();
  $(".upload").show();
  uploadNewPic();
}

function uploadNewPic() {
  $("#upload-form").on("submit", function() {
    var address = $("#location").val();
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        $("#location").val(results[0].geometry.location);
        $.ajax({
          url: "/api/picture" + username,
          type: "POST",
          data: $("#upload-form").serialize()
        }).done(function(data) {
          console.log("Posted new pic!");
        }).fail(function(a, b, c) {
          console.log("Failed to post new pic... :(");
          console.log(a, b, c);
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status + ". Please try another address.");
      }
    });
  });
}
//============================

//============================
renderHomePg();
$("#title").click(renderHomePg);
$("#login").click(renderLoginPg);
$("#create-prof").click(renderCreateProfile);
$("#upload").click(renderUploadPg);
$("#edit").click(renderEditProfile);

});