var POKEDEX_REST_PREFIX_URL = "http://pokeapi.co/api/v2/";
var pokemons = [];

$(document).on("pagecreate", "#home", function () {
    refreshAllPokemonList(function () {
        $('ul#all-pokemon').listview('refresh');
        $('ul#all-pokemon').on("tap", "li", function () {
            getPokemonDetail($(this).text());
        });
    });
});


/* Haalt pokemon op aan de hand van de api */
function refreshAllPokemonList(callback) {
    $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon?limit=20", function (data) {
        var html = "";

        for (var x = 0; x < data.results.length; x++) {
            pokemons.push(data.results[x]);
            var pokemon = pokemons[x];
            html += "<li id='" + pokemon.name + "' class='ui-btn'><a href='views/pokemon-detail.html'><span class='pkspr pkmn-" + pokemon.name + "'></span>" + pokemon.name + "</a></li>";
        }

        html += "<script>PkSpr.process_dom();</script>";

        $('ul#all-pokemon').html(html);

        callback();
    });
}

function getPokemonDetail(pokemon) {
    $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon/" + pokemon, function (data) {
        var html = "";
        var pokemon = data;

        html += ("<span class='pkspr pkmn-" + pokemon.name + "'></span>");
        html += ("<p><b>Base Experience: </b>" + pokemon.base_experience + "</p>");
        html += ("<p><b>Height: </b>" + pokemon.height + "</p>");
        html += ("<p><b>Weight: </b>" + pokemon.weight + "</p>");
        html += ("<script>PkSpr.process_dom();</script>");

        $("h1#title").text(pokemon.name);
        $('div#pokemon-data').html(html);
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
