var POKEDEX_REST_PREFIX_URL = "http://pokeapi.co/api/v2/";

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
        callback();
    });
}

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

    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {

    }
};
