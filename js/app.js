// var TRELLO_KEY = "19536d20291f823a1e48f9ade3c8563f"
// var TRELLO_SECRET = "04e813e9951ba2f4f95a0794515e2e91c9a3add2a68c1a72940f69a1bdb3e1e8"

var username = "";
var filteredComments = undefined;
// Authorization
var onAuthorize = function() {
  console.log("authorize success")
    Trello.members.get("me", function(member){
        username = member.username
      });
};
if(window.location.pathname.indexOf("authorize") == -1){
  Trello.authorize({
      type: "popup",
      name: "Trello Focus",
      expiration: "1day",
      success: onAuthorize
  });
}

// Fetch comments to show on card
var fetchLatestComments = function(){
  var url = document.URL;
  var boardId = getIdBoardFromUrl(url);
  if (boardId){
    // Fetch 200 latest comments on board
    Trello.get("boards/" + boardId + "/actions", {filter: "commentCard", fields: "data,date", limit: 200}, function(comments){
      // Sort by date asd
      comments.sort(function(a,b){a.date < b.date})

      // Distint the array by card id
      filteredComments = []
      for (var i = 0; i < comments.length; i++){
        var isExisted = false;
        for (var j = 0; j < filteredComments.length; j++){
          if (filteredComments[j].data.card.idShort == comments[i].data.card.idShort){
            isExisted = true;
            break;
          }
        }
        if (!isExisted){
          filteredComments.push(comments[i])
        }
      }

      // Try insert comments until there is data to insert
      var tryInsertCommentsTimer = setInterval(function () {
        if (showLatestComments()){
          window.clearInterval(tryInsertCommentsTimer)
        }
        // Try show cover photo
        $(".list-card-cover[style]").css("display", "block")
      }, 100);
    }, function(){
      console.log("err")
      // Retry
      // fetchLatestComments();
    });
  }
  // Trello.members.get("me", function(member){
  //   console.log(member.fullName + " ON load");
  // });
};

// Show latest comment on card
var showLatestComments = function(){
  // Add lasted comment to cards
  var inserted = false;
  $(".latest-comment").remove();
  for (var i = 0; i < filteredComments.length; i++){
    var cardTitle = $(".list-card-title[href^='/c/" + filteredComments[i].data.card.shortLink + "']");
    $('<div class="action-comment markeddown latest-comment">' + filteredComments[i].memberCreator.username + ": " + filteredComments[i].data.text + '</div>').highlight("@"+username).insertAfter(cardTitle);
    if (cardTitle.length > 0){
      inserted = true
    }
  }
  return inserted;
}

// Fetch data on load
fetchLatestComments();

// Update comment when location change (change board or open card)
var storedLocation = window.location.pathname;
window.setInterval(function () {
    if (window.location.pathname != storedLocation) {
        storedLocation = window.location.pathname;
        fetchLatestComments();
    }
}, 100);

$(document).ready(function() {
    // Try show cover photo
    $(".list-card-cover[style]").css("display", "block")
});

// var isDragging = false;
// $(window).mousedown(function() {
//   console.log("down");
//     $(window).mousemove(function() {
//         isDragging = true;
//         // $(window).unbind("mousemove");
//         console.log("dragggg");
//     });
// })
// .mouseup(function() {
//   console.log("upd");
//     var wasDragging = isDragging;
//     isDragging = false;
//     $(window).unbind("mousemove");
//     if (!wasDragging) { //was clicking
//       console.log("clickinggg")
//         // $("#throbble").show();
//     }
// });


function getIdCardFromUrl(url) {
  var strSearch = "https://trello.com/c/";
  if (url.indexOf(strSearch) != 0)
    return null;

  var remainUrl = url.slice(strSearch.length);
  var iNextSlash = remainUrl.indexOf("/");
  if (iNextSlash>=0)
      remainUrl = remainUrl.slice(0, iNextSlash);
  return remainUrl;
}

function getIdBoardFromUrl(url) {
  var strSearch = "https://trello.com/b/";
  if (url.indexOf(strSearch) != 0)
    return null;

  var remainUrl = url.slice(strSearch.length);
  remainUrl = remainUrl.slice(0, remainUrl.indexOf("/"));
  return remainUrl;
}