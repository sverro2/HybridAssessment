var db;
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

function initializeDatabase() {
    db = window.openDatabase('pokedex', '1.0', 'MBD1_Assessment_Pokedex', 2 * 1024 * 1024);

    db.transaction(function (trans) {
        trans.executeSql('CREATE TABLE IF NOT EXISTS Pokemon (name unique, caught, base_exp, height, weight)');
    });

    fillDatabaseWithPokemon();
}

function fillDatabaseWithPokemon() {
    $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon?limit=20", function (data) {
        for (var x = 0; x < data.results.length; x++) {
            var pokemon = data.results[x];
            insertPokemon(pokemon);
        }
    });
}

function insertPokemon(pokemon) {
    db.transaction(function (trans) {
        trans.executeSql('INSERT INTO Pokemon (name, caught) VALUES (?,?)', [pokemon.name, false]);
    });
}

// Werkt nog nie lekker
function updatePokemon(pokemon, caught) {
    db.transaction(function (trans) {
        trans.executeSql('UPDATE Pokemon SET caught=?, base_exp=?, height=?, weight=? WHERE name=?;',
            [caught, pokemon.base_experience, pokemon.height, pokemon.weight]);
    });
}

/* Haalt pokemon op aan de hand van de api */
function refreshAllPokemonList(callback) {
    db.transaction(function (trans) {
        trans.executeSql('SELECT * FROM Pokemon', [], function (trans, results) {
            var html = "";
            var len = results.rows.length;
            for (var x = 0; x < len; x++) {
                var pokemon = results.rows.item(x);
                var caught = (window.localStorage.getItem(pokemon.name) == true) ? window.localStorage.getItem(pokemon.name) : false;
                if (caught == true) {
                    html += "<li id='" + pokemon.name + "' class='ui-btn'><a href='views/pokemon-detail.html'><span class='pkspr pkmn-" + pokemon.name + "'></span>" + pokemon.name + "<span class='pkspr pokeball-poke'></span></a></li>";
                } else {
                    html += "<li id='" + pokemon.name + "' class='ui-btn'><a href='views/pokemon-detail.html'><span class='pkspr pkmn-" + pokemon.name + "'></span>" + pokemon.name + "</a></li>";
                }
            }

            html += "<script>PkSpr.process_dom();</script>";

            $('ul#all-pokemon').html(html);

            callback();
        });
    });
}

function fillPokemonDetail(pokemonName) {
    var pokemon;
    db.transaction(function (trans) {
        trans.executeSql('SELECT * FROM Pokemon WHERE name=?', [pokemonName], function (trans, result) {
            pokemon = result.rows.item;
        });
    });

    if (pokemon.base_exp === null && pokemon.height === null && pokemon.weight === null) {
        $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon/" + pokemon, function (data) {
            updatePokemon(pokemon, false);
        });
    }
}

// Werkt nog nie lekker
function getPokemonDetail2(pokemonName) {
    var html = "";

    db.transaction(function (trans) {
        trans.executeSql('SELECT * FROM Pokemon WHERE name=?', [pokemonName], function (trans, results) {
            var len = results.rows.length;
            for (var x = 0; x < len; x++) {
                var pokemon = results.rows.item(x);

                if (pokemon.base_exp === null && pokemon.height === null && pokemon.weight === null) {
                    $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon/" + pokemonName, function (data) {
                        updatePokemon(data, false);
                    });
                }

                html += ("<span class='pkspr pkmn-" + pokemon.name + "'></span>");
                html += ("<p><b>Base Experience: </b>" + pokemon.base_exp + "</p>");
                html += ("<p><b>Height: </b>" + pokemon.height + "</p>");
                html += ("<p><b>Weight: </b>" + pokemon.weight + "</p>");
                html += ("<script>PkSpr.process_dom();</script>");

                $("h1#title").text(pokemon.name);
                $('div#pokemon-data').html(html);
            }
        });
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
        initializeDatabase();
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
