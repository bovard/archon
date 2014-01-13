
var fs = require('fs');
var optimist = require('optimist');
var winston = require('winston');
// set up all the optimist params
var argv = optimist.boolean(['e', 't', 'h', 'l', 'm', 's', 'v'])
        .alias({
            'e': 'export-csv',
            'h': 'help',
            'l': 'elo',
            'm': 'all-maps',
            'o': 'host',
            'r': 'replay-dir',
            's': 'series',
            't': 'all-teams'
        })
        .describe({
            'e': 'Exports game data to csv',
            'h': 'Prints usage',
            'l': 'Calculates the elo for the run',
            'm': 'Runs all teams specified on all maps in maps/',
            'o': 'Specify a host for the tournament for VsWorld',
            'r': 'Specify the directory to save the replays in',
            's': 'Players play the maps in series instead 1 by 1',
            't': 'Runs all teams in teams/ on the specified maps'
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

var CLEAN = 'clean';
var WATCH = 'watch';
var MATCH = 'match';

// prints the help function

function _printMatchHelp() {
    console.log('Usage:');
    console.log('  archon match [maps] [teams]');
    console.log('Example:');
    console.log('  archon match maps/map1.xml teams/team1/ teams/team2/');
    console.log(' ');
    optimist.showHelp();
}

function _printCleanHelp() {
    console.log('Usage:');
    console.log('  archon clean');
    console.log('    Restores default settings');
}

function _printWatchHelp() {
    console.log('Usage:');
    console.log('  archon replay [replay files]');
    console.log('Example:');
    console.log('  archon replay replays/');
    console.log('    Queues up all replays in the replays/ folder');
}

function _printHelp() {
    console.log('Usage:');
    console.log('  archon [clean/replay/match]');
    console.log('See archon [clean/replay/match] --help for more info');
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
    maps = validate.removeNonMaps(maps);
    teams = validate.removeNonTeams(teams);
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
    runMatches(maps, teams, host, argv.s, argv.r, argv.e, argv.l);
}

function _clean() {
    writeCleanConf();
    writeCleanUI();
}

function cleanArgs(arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] != MATCH && arr[i] != WATCH && arr[i] != CLEAN) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

(function() {
    var match = argv._.indexOf(MATCH) !== -1;
    var watch = argv._.indexOf(WATCH) !== -1;
    var clean = argv._.indexOf(CLEAN) !== -1;

    if (argv.h) {
        if (match) {
            _printMatchHelp();
        } else if (watch) {
            _printWatchHelp();
        } else if (clean) {
            _printCleanHelp();
        } else {
            _printHelp();
        }
    } else if (clean) {
        console.log('Restoring default settings...');
        _clean();
        console.log('Done!');
    } else if (watch) {
        runReplays(cleanArgs(argv._))
    } else {
        _runMatches();
    }


}).call(this);