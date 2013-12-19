
var validate = require('./validate');
var argv = require('optimist').argv;
var runMatches = require('./runMatches').runMatches;

(function() {
    var host, maps, teams;
    var mapsTeams = validate.getMapsAndTeams(argv._);
    maps = mapsTeams[0];
    teams = mapsTeams[1];
    if (argv.host) {
        host = validate.stripLeadingPaths([argv.host])[0];
    }

    validate.validate(maps, teams);

    function callback(round, winner) {
        throw winner + ' won after round ' + round;
    }

    runMatches(maps, teams, host);


}).call(this);