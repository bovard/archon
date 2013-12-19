
var validate = require('./validate');
var fs = require('fs');
var argv = require('optimist')
    .boolean(['t', 'm'])
    .argv;
var runMatches = require('./runMatches').runMatches;

(function() {
    var host, maps, teams;
    var mapsTeams = validate.getMapsAndTeams(argv._);
    maps = mapsTeams[0];
    teams = mapsTeams[1];
    if (argv.m) {
        maps = validate.removeSystemFolders(fs.readdirSync('maps/'));
    }
    if (argv.t) {
        teams = validate.removeSystemFolders(fs.readdirSync('teams/'));
    }
    if (argv.host) {
        host = validate.stripLeadingPaths([argv.host])[0];
        while(teams.indexOf(host) !== -1) {
            teams.splice(teams.indexOf(host), 1);
        }
    }
    validate.validate(maps, teams);
    runMatches(maps, teams, host);
}).call(this);