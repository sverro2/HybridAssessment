var POKEDEX_REST_PREFIX_URL = "http://pokeapi.co/api/v2/";
var count = 0;
$(document).on("pagecreate", "#home", function () {
    $('#mainview').on('tap', '.pokemon-list', function () {
        //event voor wanneer je op een pokemon item clickt
    });

    refreshAllPokemonList(function(){
      $('ul#all-pokemon').listview('refresh');
    });
});

function refreshAllPokemonList(callback) {
    $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon", function (data) {
        var items = [];

        for(var x = 0; x < data.results.length; x++){
          items.push("<li id='" + data.results[x].name + " class='ui-btn'><a href='#'>" + data.results[x].name + "</a></li>");
        }

        //console.log(items);
        $('ul#all-pokemon').html(items.join(""));

        if(callback != null){
          callback();
        }
    });
}

function distance(lat1, lon1, lat2, lon2) {
  var earthRadius = 6371000; //meters
  var dLat = Math.PI * (lat2-lat1)/180;
    var dLng = Math.PI * (lon2-lon1)/180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(Math.PI * (lat1/180)) * Math.cos(Math.PI * (lat2/180)) *
               Math.sin(dLng/2) * Math.sin(dLng/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var dist = earthRadius * c;
	return dist;
}

//TODO: wehalen:
var latgang = 51.6881837;
var longgang = 5.2860431;

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
      navigator.geolocation.watchPosition(function(position){
        $('.lat').html(position.coords.latitude);
        $('.long').html(position.coords.longitude);
        $('.count').html("Distance: " + distance(position.coords.latitude, position.coords.longitude, latgang, longgang) + "M");
      }, function(error){
        console.log("An error occured when optaining the position: " + error);
      },
      { enableHighAccuracy: true });

    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {

    }
};
