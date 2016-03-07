var POKEDEX_REST_PREFIX_URL = "http://pokeapi.co/api/v2/";

$(document).on("pagecreate", "#home", function(){
  $('#mainview').on('tap', '.pokemon-list', function(){
    //event voor wanneer je op een pokemon item clickt
  });

  refreshAllPokemonList();
});

function refreshAllPokemonList(){
  $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon?limit=151", function( data ) {
    var items = [];
    $.each( data, function( key, val ) {
      console.log("key: " + key + ", value: " + val);
      items.push( "<li id='" + key + "'>" + val + "</li>" );
    });

    $( "<ul/>", {
      "class": "my-new-list",
      html: items.join( "" )
    }).appendTo( "body" );
  });
  $.each(myTodos, function(index, item){
    todoDOM = todoDOM.concat("<li><a href=\"#\" class=\"ui-icon-check todo-item\" data-id=" + item.id + "><span class=\"user\">" +
    item.user + "</span><span class=\"time\">(" +
    item.time + "):</span> " + item.description + "</a></li>");
  });
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

    }
};
