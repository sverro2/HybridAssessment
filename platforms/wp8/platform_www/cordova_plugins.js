cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-websql/www/WebSQL.js",
        "id": "cordova-plugin-websql.WebSQL",
        "pluginId": "cordova-plugin-websql",
        "merges": [
            "window"
        ]
    },
    {
        "file": "plugins/cordova-plugin-websql/www/wp8/Database.js",
        "id": "cordova-plugin-websql.Database",
        "pluginId": "cordova-plugin-websql"
    },
    {
        "file": "plugins/cordova-plugin-websql/www/wp8/SqlTransaction.js",
        "id": "cordova-plugin-websql.SqlTransaction",
        "pluginId": "cordova-plugin-websql"
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-websql": "0.0.10",
    "cordova-plugin-whitelist": "1.2.1"
}
// BOTTOM OF METADATA
});