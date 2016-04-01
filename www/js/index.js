//globals
var db;
var POKEDEX_REST_PREFIX_URL = "http://pokeapi.co/api/v2/";
var pokemons = [];
var locationsToFindPokemon;
var selectedLocation;
var pokemonToCatch;
var isCloseBy = false;
var noLocationsDialogShown = false;
var compass;
var bearing = 0;
var degrees = 0;
var compassDegrees = 0;
var currentLocation = {
  lat: "",
  long: ""
};

//jquery magic
$(document).on("pagecreate", "#home", function () {
    var tabCounter = 0;
    $('#mainview').on('tap', function(){
      tabCounter++;
      //wanneer het hoofdscherm 5x aan word geraakt wordt de huidige locatie toevoegd
      if(tabCounter == 5){
        addLocation();
      }
      setTimeout(function(){ tabCounter = 0; }, 1500);
    });
    $('#refresh').on('tap', function () {
      _refreshMyPokemonList();
    });
    $('#force-refresh').on('tap', function () {
      forceRefreshAllPorkemonList();
    });
    $('#navigate-button').on('tap', function(event){
      if(selectedLocation){
        startCompass();
        setTimeout(function(){ compassInit(); }, 500);
      }else{
        event.preventDefault();
        alert("No lations available");
      }
    });
    $(document).on('pageinit', '#pokemon-settings', function () {
      getSetting("pokemon-cache-count", function(value){
        $('body').find("#amount-of-pokemon-to-cache").val(value);
      });
    });
    $('body').on('tap', '.compass-close', function () {
      navigator.compass.clearWatch(compass);
    });
    $('body').on('tap', '#save-settings-button', function () {
      var setting = $('body').find("#amount-of-pokemon-to-cache").val();
      setSetting("pokemon-cache-count", setting);
      alert(setting);
    });
    $("#mainview").on('swipeleft', function(){
      $("#my-pokemon-tab-header").trigger("click");
    });
    $("#mainview").on('swiperight', function(){
      $("#all-pokemon-tab-header").trigger("click");
    });
});

//starting the compass
function startCompass(){
  function onSuccess(heading) {
    $("#nav-compass").text(heading.magneticHeading);
    compassDegrees = heading.magneticHeading;
    degrees = bearing - compassDegrees;;
  };

  function onError(compassError) {
    alert('Compass error: ' + compassError.code);
  };

  var options = {
    frequency: 100
  };

  compass = navigator.compass.watchHeading(onSuccess, onError, options);
}

//refresh all-pokemon list and update mobile UI
function _refreshAllPokemonList(){
  refreshAllPokemonList(function () {
      $('ul#all-pokemon').listview('refresh');
      $('ul#all-pokemon').on("tap", "li", function () {
          getPokemonDetail($(this).text());
      });
  });
}

//refresh my-pokemon list and update mobile UI
function _refreshMyPokemonList(){
  refreshMyPokemonList(function () {
      $('ul#my-pokemon').listview('refresh');
      $('ul#my-pokemon').on("tap", "li", function () {
          getPokemonDetail($(this).text());
      });
  });
}

//create the datebase used by this application
function initializeDatabase(callback) {
    db = window.openDatabase('pokedex', '1.0', 'MBD1_Assessment_Pokedex', 2 * 1024 * 1024);

    db.transaction(function (trans) {
        trans.executeSql('CREATE TABLE IF NOT EXISTS AllPokemon (name unique)');
        trans.executeSql('CREATE TABLE IF NOT EXISTS MyPokemon (name)');
        trans.executeSql('CREATE TABLE IF NOT EXISTS Locations (name unique, lat, long)');
        trans.executeSql('CREATE TABLE IF NOT EXISTS Settings (key unique, value)');

        // trans.executeSql('DELETE FROM AllPokemon');
        // trans.executeSql('DELETE FROM MyPokemon');
        // trans.executeSql('DELETE FROM Locations');
    }, function(err){
      console.log("An error occured whil enhancing the database");
      console.log(err);
    }, function(){
      fillDatabaseWithPokemon(callback);
    });

}

//read pokemon from the pokeapi or database
function fillDatabaseWithPokemon(callback) {
    db.transaction(function (trans) {
        trans.executeSql('SELECT COUNT(*) AS count FROM AllPokemon', [], function (trans, results) {
            var len = results.rows[0].count;

            //als de database all gevuld is doe dan niet meer de request
            if(len == 0){
              $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon?limit=151", function (data) {
                  for (var x = 0; x < data.results.length; x++) {
                      var pokemon = data.results[x];
                      insertPokemon(pokemon);
                      callback();
                  }
              });
            }else{
              callback();
            }
        });
    });
}

//force to delete cache and contact pokeapi
function forceRefreshAllPorkemonList(){
  db.transaction(function (trans) {
    trans.executeSql('DELETE FROM AllPokemon');
  }, function(err){
    console.log("An error occured whil enhancing the database");
    console.log(err);
  }, function(){
    fillDatabaseWithPokemon(_refreshAllPokemonList);
  });
}

//add a pokemon to the all-pokemon table
function insertPokemon(pokemon) {
    db.transaction(function (trans) {
        trans.executeSql('INSERT INTO AllPokemon (name) VALUES (?)', [pokemon.name]);
    });
}

//add pokemonToCatch to my pokemon
function catchPokemon() {
    db.transaction(function (trans) {
        trans.executeSql('INSERT INTO MyPokemon (name) VALUES (?)', [pokemonToCatch.name]);
    });
}

/* obtains all-pokemon from database */
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

//obtains my pokemon from database
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

//obtain and set details of the pokemon detail view
function getPokemonDetail(pokemon) {
    $.getJSON(POKEDEX_REST_PREFIX_URL + "pokemon/" + pokemon, function (data) {
        var html = "";
        var pokemon = data;

        html += ("<span class='pkspr pkmn-" + pokemon.name + "'></span>");
        html += ("<p><b>Base Experience: </b>" + pokemon.base_experience + "</p>");
        html += ("<p><b>Height: </b>" + pokemon.height + "</p>");
        html += ("<p><b>Weight: </b>" + pokemon.weight + "</p>");
        html += ("<a href=\"#\" onclick=\"window.open('http://pokeapi.co/', '_system');\">© PokeApi.co</a>");
        html += ("<script>PkSpr.process_dom();</script>");

        $("h1#title").text(pokemon.name);
        $('div#pokemon-data').html(html);
    });
}

//what needs to be done when a pokemon is detected within range
function inRadiusOfPokemon(){
  cordova.plugins.notification.local.schedule({
      id: 1,
      title: "Catch!",
      message: "Hurry now! You are near a pokemon. Catch it!"
  });
  $("#btn-back").trigger("click");
  setTimeout(function(){ $.mobile.navigate( "views/pokemon-catch.html" ); }, 500);
}

//what needs to be done when a pokemon was detected, but now is out of range
function outOfRadiusOfPokemon(){
  $("#btn-back").trigger("click");
  cordova.plugins.notification.local.cancel(1, function () {
    alert("One pokemon has fled away :'(");
  });
}

//check wether or not a pokemon is within range (in order to decide wheter or not the pokemon can be caught)
function checkIsInRadius(){
  navigator.geolocation.watchPosition(function(position){
      currentLocation.lat = position.coords.latitude;
      currentLocation.long = position.coords.longitude;

      var nearestLocation = getNearestLocationDistance();
      if(isCloseBy === false && nearestLocation < 50){
        isCloseBy = true;
        inRadiusOfPokemon();
      }else if(isCloseBy === true && nearestLocation > 70){
        isCloseBy = false;
        outOfRadiusOfPokemon();
      }
    }, function(error){
      console.log("An error occured when optaining the position: " + error);
    },
    { enableHighAccuracy: true }
  );
}

//catch the pokemon
function tryCatchPokemon(){
  if(pokemonToCatch == ""){
    alert("There is no pokemon to catch!");
  }
  isCloseBy = false;
  cordova.plugins.notification.local.cancel(1, function () {});
  catchPokemon();
  db.transaction(function (trans) {
      trans.executeSql('DELETE FROM Locations WHERE name=?', [selectedLocation.name]);
  }, function(err){
    if(err){
      alert("An error occured when catching the pokemon " + err);
    }
  }, function(){
    $("#btn-back").trigger("click");
    _refreshMyPokemonList();
    $('#my-pokemon-tab-header').trigger('click');
    refreshLocations();
    refreshPokemonToFind();
    alert("Caught " + pokemonToCatch.name + " at " + selectedLocation.name);
    pokemonToCatch = "";
    selectedLocation = null;
  });
}

//add a location where pokemon can be found (to be used once)
//this function is called when clicking items (except pokemon) in the mainview 5 times
function addLocation(){
  var locationName = prompt("What do you like to call current location?");
  if(locationName){
    var location = currentLocation;
    if(!location.lat || !location.long){
      alert("Please check whether your location service is enabled and try again.");
      return;
    }
    db.transaction(function (trans) {
        trans.executeSql('INSERT INTO Locations (name, lat, long) VALUES (?,?,?)', [locationName, location.lat, location.long]);
    }, function(error){
      console.log("an error occured while adding an location:" + error);
    }, function(){
      alert("Location '" + locationName + "'\n" + location.lat + "," + location.long + "\nHas been added.");
      refreshFinderArrays();
    });
  }
}

//obtain nearest location (selectedLocation) and return distance to this location
function getNearestLocationDistance(){
  if(locationsToFindPokemon.length == 0){
    if(!noLocationsDialogShown){
      alert("No locations are suitable for pokemon at the moment");
      noLocationsDialogShown = true;
    }
    return 100;
  }else{
    noLocationsDialogShown = false;
    var smallestDistance;
    var location;
    for(var x = 0; x < locationsToFindPokemon.length; x++){
      var locationDistance = calculateDistance(locationsToFindPokemon[x].lat, locationsToFindPokemon[x].long, currentLocation.lat, currentLocation.long);

      if(!smallestDistance || locationDistance < smallestDistance){
        smallestDistance = locationDistance;
        location = locationsToFindPokemon[x];
      }
    }
    selectedLocation = location;
    //set nav VALUES
    $("#nav-location-name").text(location.name);
    bearing = calculateBearing(currentLocation.lat,currentLocation.long , location.lat, location.long);
    $("#nav-location-bearing").text(bearing);
    $("#nav-location-distance").text(smallestDistance);
    return smallestDistance;
  }
}

//refresh all data related to catching pokemon (locations, pokemons to catch)
//calback makes sure everything is initialized before proceeding further
function refreshFinderArrays(callback){
  refreshLocations(refreshPokemonToFind(callback))
}

//obtain list with all locations where pokemon can be found
function refreshLocations(callback){
  var locArray = [];

  db.transaction(function (trans) {
      trans.executeSql('SELECT * FROM Locations', [], function (trans, results) {
          var len = results.rows.length;
          for (var x = 0; x < len; x++) {
               locArray.push(results.rows.item(x));
          }
      });
  }, function(err){
    if(err){
      alert("An error occured when trying to find a new pokemon location " + err);
    }
  }, function(){
    locationsToFindPokemon = locArray;
    if(callback) callback();
  });
}

//obtain pokemon that is not yet added to "my-pokemon"
function refreshPokemonToFind(callback){
  db.transaction(function (trans) {
      trans.executeSql('SELECT * FROM AllPokemon WHERE name NOT IN (SELECT name FROM MyPokemon)', [], function (trans, results) {
          var len = results.rows.length;

          if(len){
            pokemonToCatch = results.rows.item(Math.floor(Math.random()*len));
          }
          //alert(pokemonToCatch.name + " is in the neighbourhood");
      });
  }, function(err){
    if(err){
      console.log(err);
      alert("An error occured when trying to find a random pokemon " + err);
    }
  },function(){
    if(callback) callback();
  });
}

//calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2){
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

function calculateBearing(lat1, lon1, lat2, lon2){
  var dlon = toRadian(lon2-lon1);
  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);
  var y = Math.sin(dlon) * Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2) -
          Math.sin(lat1)*Math.cos(lat2)*Math.cos(dlon);
  var bearing = toDegree(Math.atan2(y, x));
  bearing = ((bearing + 360) % 360);
  return bearing;
}

//convert degree to radial
function toRadian(degrees){
  return degrees * Math.PI / 180;
}

//conver radial to degree
function toDegree(radians){
  return radians * 180 / Math.PI;
}

//set a setting
function setSetting(key, value){
  db.transaction(function (trans) {
      trans.executeSql('INSERT OR IGNORE INTO Settings (key, value) VALUES (?,?)', [key, value]);
      trans.executeSql('UPDATE Settings SET value=? WHERE key=?', [value, key]);
  }, function(error){
    console.log("Could not save setting:");
    console.log(error)
  }, function(){
    alert("Changes have been saved");
  });
}

//get setting
function getSetting(key, callback){
  db.transaction(function (trans) {
    trans.executeSql('SELECT * FROM Settings WHERE key=?', [key], function (trans, results) {
        var len = results.rows.length;

        if(len){
          callback(results.rows[0].value)
        }
    });
  });
}

var app = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
      initializeDatabase(function(){
        refreshFinderArrays(function(){
          _refreshMyPokemonList();
          _refreshAllPokemonList();
          checkIsInRadius();
        });
      });
    }
};

//compass needle animation
function compassInit()
{
    // Grab the compass element
    var canvas = $('body').find('#compass')[0];

    // Canvas supported?
    if(canvas.getContext('2d'))
    {
        ctx = canvas.getContext('2d');

        // Load the needle image
        needle = new Image();
        needle.src = '../img/compass-needle.png';
        needle.onload = setInterval(draw, 100);;
    }
    else
    {
        alert("Canvas not supported!");
    }

}

function clearCanvas() {
	 // clear canvas
	ctx.clearRect(0, 0, 200, 200);
}

function draw()
{
    clearCanvas();

    ctx.save();

    ctx.translate(100, 100);
    ctx.rotate(degrees * (Math.PI / 180));
    ctx.drawImage(needle, -100, -100);

    ctx.restore();
}
