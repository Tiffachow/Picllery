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