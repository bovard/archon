
var fs = require('fs');
var optimist = require('optimist');
var winston = require('winston');
var argv = optimist.boolean(['t', 'h', 'm', 's'])
        .alias({
            't': 'all-teams',
            'm': 'all-maps',
            'o': 'host',
            'h': 'help',
            's': 'series'
        })
        .describe({
            't': 'Runs all teams in teams/ on the specified maps',
            'm': 'Runs all teams specified on all maps in maps/',
            'o': 'Specify a host for the tournament for VsWorld',
            'h': 'Prints usage',
            's': 'Players play the maps in series instead 1 by 1'
        })
        .argv;

var runMatches = require('./runMatches').runMatches;
var validate = require('./validate');

var LOG_LEVEL = 'warning';
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {level: LOG_LEVEL});

function printHelp() {
    console.log('Usage:');
    console.log('  archon [options] [maps] [teams]');
    console.log('Example:');
    console.log('  archon maps/map1.xml teams/team1/ teams/team2/');
    console.log(' ');
    optimist.showHelp();
}

(function() {
    var host, maps, teams;

    if (argv.h) {
        printHelp();
        return;
    }

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
    try {
        validate.validate(maps, teams);
    } catch (e) {
        printHelp();
        throw e;
    }
    runMatches(maps, teams, host, argv.s);
}).call(this);