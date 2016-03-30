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

    $('#refresh').on('tap', function () {
        refreshMyPokemonList(function () {
            $('ul#my-pokemon').listview('refresh');
            $('ul#my-pokemon').on("tap", "li", function () {
                getPokemonDetail($(this).text());
            });
        });
    })
});

function initializeDatabase() {
    db = window.openDatabase('pokedex', '1.0', 'MBD1_Assessment_Pokedex', 2 * 1024 * 1024);

    db.transaction(function (trans) {
        trans.executeSql('CREATE TABLE IF NOT EXISTS AllPokemon (name unique)');
        trans.executeSql('CREATE TABLE IF NOT EXISTS MyPokemon (name)');
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
        trans.executeSql('INSERT INTO AllPokemon (name) VALUES (?)', [pokemon.name]);
    });
}

function catchPokemon(pokemon) {
    db.transaction(function (trans) {
        trans.executeSql('INSERT INTO MyPokemon (name) VALUES (?)', [pokemon]);
    });
}

/* Haalt pokemon op aan de hand van de api */
function refreshAllPokemonList(callback) {
    db.transaction(function (trans) {
        trans.executeSql('SELECT * FROM AllPokemon', [], function (trans, results) {
            var html = "";
            var len = results.rows.length;
            for (var x = 0; x < len; x++) {
                var pokemon = results.rows.item(x);
                html += "<li id='" + pokemon.name + "' class='ui-btn'><a href='views/pokemon-detail.html'><span class='pkspr pkmn-" + pokemon.name + "'></span>" + pokemon.name + "</a></li>";
            }

            html += "<script>PkSpr.process_dom();</script>";

            $('ul#all-pokemon').html(html);

            callback();
        });
    });
}

function refreshMyPokemonList(callback) {
    db.transaction(function (trans) {
        trans.executeSql('SELECT DISTINCT * FROM MyPokemon', [], function (trans, results) {
            var html = "";
            var len = results.rows.length;
            for (var x = 0; x < len; x++) {
                var pokemon = results.rows.item(x);
                html += "<li id='" + pokemon.name + "' class='ui-btn'><a href='views/pokemon-detail.html'><span class='pkspr pkmn-" + pokemon.name + "'></span>" + pokemon.name + "</a></li>";
            }

            html += "<script>PkSpr.process_dom();</script>";

            $('ul#my-pokemon').html(html);

            callback();
        });
    });
}

function fillPokemonDetail(pokemonName) {
    var pokemon;
    db.transaction(function (trans) {
        trans.executeSql('SELECT * FROM AllPokemon WHERE name=?', [pokemonName], function (trans, result) {
            pokemon = result.rows.item;
        });
    });

    if (pokemon.base_exp === null && pokemon.height === null && pokemon.weight === null) {
        $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon/" + pokemon, function (data) {
            catchPokemon(pokemon, false);
        });
    }
}

// Werkt nog nie lekker
function getPokemonDetail2(pokemonName) {
    var html = "";

    db.transaction(function (trans) {
        trans.executeSql('SELECT * FROM AllPokemon WHERE name=?', [pokemonName], function (trans, results) {
            var len = results.rows.length;
            for (var x = 0; x < len; x++) {
                var pokemon = results.rows.item(x);

                if (pokemon.base_exp === null && pokemon.height === null && pokemon.weight === null) {
                    $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon/" + pokemonName, function (data) {
                        catchPokemon(data, false);
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
