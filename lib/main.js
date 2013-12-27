
var fs = require('fs');
var optimist = require('optimist');
var winston = require('winston');
// set up all the optimist params
var argv = optimist.boolean(['c', 't', 'h', 'm', 's', 'v'])
        .alias({
            'c': 'clean',
            'h': 'help',
            'm': 'all-maps',
            'o': 'host',
            'r': 'replay-dir',
            's': 'series',
            't': 'all-teams',
            'v': 'visualize'
        })
        .describe({
            'c': 'Cleans up after archon and restores defaults',
            'h': 'Prints usage',
            'm': 'Runs all teams specified on all maps in maps/',
            'o': 'Specify a host for the tournament for VsWorld',
            'r': 'Specify the directory to save the replays in',
            's': 'Players play the maps in series instead 1 by 1',
            't': 'Runs all teams in teams/ on the specified maps',
            'v': 'Runs the specified replay(s) in the viewer'
        }).default({
            'r': 'replays'
        })
        .argv;

var runMatches = require('./runMatches').runMatches;
var runReplays = require('./watchReplay').runReplays;
var writeCleanUI = require('./writeUI').writeCleanUI;
var writeCleanConf = require('./writeConf').writeCleanConf;
var validate = require('./validate');

var LOG_LEVEL = 'warning';
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {level: LOG_LEVEL});

// prints the help function
function printHelp() {
    console.log('Usage:');
    console.log('  archon [options] [maps] [teams]');
    console.log('Example:');
    console.log('  archon maps/map1.xml teams/team1/ teams/team2/');
    console.log(' ');
    optimist.showHelp();
}


function _runMatches() {
    var host, maps, teams, validateTeams, validateMaps;
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
        validateTeams = teams.slice(0);
        if (host) {
            validateTeams.push(host)
        }
        validateMaps = maps.slice(0);
        validate.validate(validateMaps, validateTeams, argv.s);
    } catch (e) {
        console.log('Looks like one of the inputs is wrong!');
        console.log(' ');
        printHelp();
        throw e;
    }
    runMatches(maps, teams, host, argv.s, argv.r);
}


(function() {

    if (argv.h) {
        printHelp();
    } else if (argv.c) {
        console.log('Restoring default settings...');
        writeCleanConf();
        writeCleanUI();
        console.log('Done!');
    } else if (argv.v) {
        runReplays(argv._)
    } else {
        _runMatches();
    }


}).call(this);