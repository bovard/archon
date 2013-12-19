
var validate = require('./validate');
var argv = require('optimist').argv;
var game = require('./game');

(function() {
    var host, maps, teams;
    var mapsTeams = validate.getMapsAndTeams(argv._);
    maps = mapsTeams[0];
    teams = mapsTeams[1];
    if (argv.host) {
        host = validate.stripLeadingPaths([argv.host]);
    }

    if (!validate.validate(maps, teams)) {
        throw 'Invalid Invocation or File Not Found';
    }

    function callback(round, winner) {
        throw winner + ' won after round ' + round;
    }

}).call(this);