// Define some variables used to remember state.
var playlistId;
var currentPlaylist = [];
var socket;
var currentSong = 0;

// After the API loads, call a function to enable the playlist creation form.
function handleAPILoaded() {
    enableForm();
    bindSocket();
}

// Enable the form for creating a playlist.
function enableForm() {
  $('.disabled_button').attr('disabled', false);  
}

// Create a private playlist.
function createPlaylist() {
  var request = gapi.client.youtube.playlists.insert({
    part: 'snippet,status',
    resource: {
      snippet: {
        title: 'Querate Custom Playlist',
        description: 'A public playlist created for you and your friends'
      },
      status: {
        privacyStatus: 'public'
      }
    }
  });
  request.execute(function(response) {
    var result = response.result;
    if (result) {
        playlistId = result.id;
        console.log(playlistId);
        $('#playlist-id').val(playlistId);
        storePlaylistVar();
    } else {
        alert('Could not create playlist');
    }
  });
}

function joinPlaylist() {
    $("#join_button, #playlist_button").fadeOut("slow");
    $(".join_field").fadeIn("slow").css("display", "inline-block");
    $("#join_check").click(function() {
        playlistId = $('#join_id').val();
        $('#playlist-id').val(playlistId);
        requestVideoPlaylist(playlistId, false);
        $("#play, #skip").fadeOut("slow");
        player.mute();
        player.pauseVideo();
        getCurrentSong();
    });    
}

function getPlaylistID (){
    return playlistId;
}

// Add a video ID specified in the form to the playlist.
function addVideoToPlaylist(val) {
    addToPlaylist(val);
}

// Add a video to a playlist. The "startPos" and "endPos" values let you
// start and stop the video at specific times when the video is played as
// part of the playlist. However, these values are not set in this example.
function addToPlaylist(id, startPos, endPos) {
  var details = {
    videoId: id,
    kind: 'youtube#video'
  }
  if (startPos != undefined) {
    details['startAt'] = startPos;
  }
  if (endPos != undefined) {
    details['endAt'] = endPos;
  }
  var request = gapi.client.youtube.playlistItems.insert({
    part: 'snippet',
    resource: {
      snippet: {
        playlistId: playlistId,
        resourceId: details
      }
    }
  });
  request.execute(function(response) {
        requestVideoPlaylist(getPlaylistID(), true);
        // $('#status').html('<pre>' + JSON.stringify(response.result) + '</pre>');
  });
}

// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, isAdd, pageToken) {  
    if(playlistId != undefined) {    
        var pIID;
        var requestOptions = {
            playlistId: playlistId,
            part: 'snippet',
            maxResults: 50
        };
        if (pageToken) {
            requestOptions.pageToken = pageToken;
        }
        var request = gapi.client.youtube.playlistItems.list(requestOptions);
        request.execute(function(response) {
            var playlistItems = response.items;
            if(isAdd)
                addPlaylistObject(playlistItems);
            else {
                recreatePlaylistObject(playlistItems);
            }
        }); 
    }
}

function recreatePlaylistObject(playlistItems) {
    currentPlaylist = [];
    $.each(playlistItems, function(index){
        currentPlaylist.push({id: playlistItems[index].id, title: playlistItems[index].snippet.title, rating: 0});
    });
    createEntireTrackList();
}

function addPlaylistObject(playlistItems) {
    var index = playlistItems.length - 1;        
    currentPlaylist.push({id: playlistItems[index].id, title: playlistItems[index].snippet.title, rating: 0});
    createTrack(index);
}

function removePlaylistObject($id) {
    $id.parent().remove();   
}

function getPlaylistObject(){
    return currentPlaylist;
}

function createEntireTrackList() {
    for(var i = player.getPlaylistIndex(); i < currentPlaylist.length; i++) {
        if(i == 0)
            $("#playlist").append("<div class='playlist_track'><div class='track_num'>></div><div class='track_artist_song'><h3 style='margin-top: 10px;'>" + currentPlaylist[i].title.substring(0, currentPlaylist[i].title.indexOf(" - ")) +"</h3><h2>" + currentPlaylist[i].title.substring(currentPlaylist[i].title.indexOf(" - ") + 3, currentPlaylist[i].title.length) + "</h2></div><div index=" + i + " value= '" + currentPlaylist[i].id +"' state='0' class='track_rating'><div class='arrow_up'></div><p>" + currentPlaylist[i].rating + "</p><div class='arrow_down'></div></div></div>");
        else
            $("#playlist").append("<div class='playlist_track'><div class='track_num'>" + i +"</div><div class='track_artist_song'><h3 style='margin-top: 10px;'>" + currentPlaylist[i].title.substring(0, currentPlaylist[i].title.indexOf(" - ")) +"</h3><h2>" + currentPlaylist[i].title.substring(currentPlaylist[i].title.indexOf(" - ") + 3, currentPlaylist[i].title.length) + "</h2></div><div index=" + i + " value= '" + currentPlaylist[i].id +"' state='0' class='track_rating'><div class='arrow_up'></div><p>" + currentPlaylist[i].rating + "</p><div class='arrow_down'></div></div></div>");
    }
    setTimeout(function(){
        loadCurrentPlaylist();
    }, 1000);
    $(".fa-play").addClass("fa-pause");
    rebindRating();
}

function loadCurrentPlaylist() {
    player.loadPlaylist({list: getPlaylistID(),
                        listType:"playlist",
                        index:player.getPlaylistIndex(),
                        startSeconds: player.getCurrentTime(),
                        suggestedQuality:"default"});    
}

function createTrack(i){
    if(i == 0)
        $("#playlist").append("<div class='playlist_track'><div class='track_num'>></div><div class='track_artist_song'><h3 style='margin-top: 10px;'>" + currentPlaylist[i].title.substring(0, currentPlaylist[i].title.indexOf(" - ")) +"</h3><h2>" + currentPlaylist[i].title.substring(currentPlaylist[i].title.indexOf(" - ") + 3, currentPlaylist[i].title.length) + "</h2></div><div index=" + i + " value= '" + currentPlaylist[i].id +"' state='0' class='track_rating'><div class='arrow_up'></div><p>" + currentPlaylist[i].rating + "</p><div class='arrow_down'></div></div></div>");
    else
        $("#playlist").append("<div class='playlist_track'><div class='track_num'>" + i +"</div><div class='track_artist_song'><h3 style='margin-top: 10px;'>" + currentPlaylist[i].title.substring(0, currentPlaylist[i].title.indexOf(" - ")) +"</h3><h2>" + currentPlaylist[i].title.substring(currentPlaylist[i].title.indexOf(" - ") + 3, currentPlaylist[i].title.length) + "</h2></div><div index=" + i + " value= '" + currentPlaylist[i].id +"' state='0' class='track_rating'><div class='arrow_up'></div><p>" + currentPlaylist[i].rating + "</p><div class='arrow_down'></div></div></div>");
}

function reValueOrder() {
    $(".track_num").each(function(index) {
        if(index == 0)
            $(this).text(">");
        else
            $(this).text(index);
    });
}

function reValueIndex() {
    reValueOrder();
    var len = 0;
    $(".track_rating").each(function() {
        len++;
    });    
    for (var i = player.getPlaylistIndex(); i < len; i++) {
        $(".track_rating").attr("index", i); 
    }
}

function removeFromPlaylist(pid) {  
    var request = gapi.client.youtube.playlistItems.delete({
        id: pid
    });
    request.execute(function(response) {
        // $('#status').html('<pre>' + JSON.stringify(response.result) + '</pre>');
    });
}

function search(query) {
    var q = query;
    console.log (q);
    var request = gapi.client.youtube.search.list({
        q: q,
        part: 'snippet'
    });
    request.execute(function(response) {
        var resultItems = response.items;
        populateResults(resultItems);
    });
}

function populateResults(resultItems) {
    $("#results").empty();
    setTimeout(function(){
        $.each(resultItems, function(index) {
            $("#results").append("<div class='result_track' value=" + resultItems[index].id.videoId + "><p> " + resultItems[index].snippet.title + "</p></div>");          
        });
        bindResults();
    }, 500);
}

function bindResults() {
    $(".result_track").click(function(){
        var trackID = $(this).attr("value")
        
        updateServer();
        
        addVideoToPlaylist(trackID);     
        
        // setTimeout(function(){
            // loadCurrentPlaylist();
        // }, 1000);
        
        setTimeout(function(){
            rebindRating();
            reValueOrder();
        }, 1500);

        $(".fa-play").addClass("fa-pause");
     
        hideSearch();                    
    });
}
    
function rebindRating() {
    $(".arrow_up").unbind('click').click(function(){
        var $parent = $(this).parent(".track_rating");
        var rating = rateTrack($parent, true);
        $parent.children("p").text(rating);        
        checkRating (rating, $parent);
    });
    $(".arrow_down").unbind('click').click(function(){
        var $parent = $(this).parent(".track_rating");
        var rating = rateTrack($parent, false);
        $parent.children("p").text(rating);        
        checkRating (rating, $parent);
    });    
}

function rateTrack($id, isUp) {
    var curr = "";                                        
    if(isUp) {    
        if($id.attr("state") != 1) {
            $id.children("p").css("color", "#f76f2c");
            curr = parseInt($id.children("p").text()) + 1;
            $id.attr("state", 1);            
        } else {
            $id.children("p").css("color", "#000000");
            curr = parseInt($id.children("p").text()) - 1;
            $id.attr("state", 0);            
        } 
    } else {
        // if($id.attr("state") != 2) {
            $id.children("p").css("color", "#999999");
            curr = parseInt($id.children("p").text()) - 1;
            $id.attr("state", 2);            
        // } else {
        //     $id.children("p").css("color", "#000000");
        //     curr = parseInt($id.children("p").text()) + 1;
            // $id.attr("state", 0);
        // }       
    }
    return curr;
}

function checkRating (num, $id){
    var rating = parseInt(num);
    if (rating < -5)
        removeVideo($id);
}                

function removeVideo($id) {
    var tid = $id.attr("value");
    console.log(tid);
    removeFromPlaylist(tid);
    
    updateServer();
    
    currentPlaylist.splice($id.attr("index"), 1);
    removePlaylistObject($id);
    reValueIndex();
}
                                                
function hideSearch() {
    $("#search_area").fadeOut("slow");
    $("#search").css({"background-color" : "#e6e6e6", "color" : "#000"});
}

function bindSocket(){
    socket = io.connect('http://' + document.domain + ':' + location.port + '/test');                
    socket.on('my response', function(msg) {
        console.log(msg.data);
        if(msg.data == "RefreshList") {            
            setTimeout(function(){
                $("#playlist").empty();
                setTimeout(function(){
                    requestVideoPlaylist(playlistId, false);  
                }, 200);                              
            }, 800);            
        }
    });
}

function updateServer() {
    socket.emit('my broadcast event', {data: "RefreshList"});    
}

function storePlaylistVar() {    
    $.getJSON('/_set_playlist_id', {
            playlist: playlistId
        }, function(data) {
         console.log(data.result);
    });
}

function setCurrentSong() {
    $.getJSON('/_set_current_song', {
            playlist: playlistId,
            current: player.getPlaylistIndex()
        }, function(data) {
         console.log("SET CS: " + data.result);
    });    
}

function getCurrentSong() {
    $.getJSON('/_get_current_song', {
            playlist: playlistId
        }, function(data) {
         console.log("GET CS: " + data.result);
    });    
}



    

        



