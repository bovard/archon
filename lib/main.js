
var fs = require('fs');
var optimist = require('optimist');
var winston = require('winston');
// set up all the optimist params
var argv = optimist.boolean(['a', 'b', 'd', 'e', 'g', 'h', 'l', 'm', 'n', 's', 't', 'v', 'x'])
        .alias({
            'a': 'local-branches',
            'b': 'remote-branches',
            'c': 'cache-server',
            'd': 'do-report',
            'e': 'export-csv',
            'g': 'tags',
            'h': 'help',
            'l': 'elo',
            'm': 'all-maps',
            'n': 'no-replays',
            'o': 'host',
            'r': 'replay-dir',
            's': 'series',
            't': 'all-teams',
            'v': 'version',
            'x': 'mirror'
        })
        .describe({
            'a': 'Spawns teams from all local branches',
            'b': 'Spawns teams from all remote branches',
            'c': 'Specifies a server to pull/push results',
            'd': 'Do report games to the cache server',
            'e': 'Exports game data to csv',
            'g': 'Spawns teams from all git tags',
            'h': 'Prints usage',
            'l': 'Calculates the elo for the run',
            'm': 'Runs all teams specified on all maps in maps/',
            'n': 'Does not save replays for matches',
            'o': 'Specify a host for the tournament for VsWorld',
            'r': 'Specify the directory to save the replays in',
            's': 'Players play the maps in series instead 1 by 1',
            't': 'Runs all teams in teams/ on the specified maps',
            'v': 'Print version',
            'x': 'Runs 2x the matches with teams as both A and B'
        }).default({
            'r': 'replays'
        })
        .argv;

var runMatches = require('./runMatches').runMatches;
var runReplays = require('./watchReplay').runReplays;
var writeCleanUI = require('./writeUI').writeCleanUI;
var writeCleanConf = require('./writeConf').writeCleanConf;
var validate = require('./validate');
var clearTeams = require('./clearTeams');
var spawnTeams = require('./spawnTeams');

var LOG_LEVEL = 'warning';
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {level: LOG_LEVEL});

var CLEAN = 'clean';
var WATCH = 'watch';
var MATCH = 'match';
var KILL = 'kill';
var SPAWN = 'spawn';

// prints the help function

function _printMatchHelp() {
    console.log('Usage:');
    console.log('  archon match [maps] [teams] [-e/-l/-m/-o/-r/-s/-t/-n]');
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

function _printKillHelp() {
    console.log('Usage:');
    console.log('  archon kill');
    console.log('    removes all spawned teams from the teams folder');
    console.log('BETA: Does not work on windows, sorry');

}

function _printSpawnHelp() {
    console.log('Usage:');
    console.log('  archon spawn [tags/local branches] [-a/-b/-g]');
    console.log('  spawns a player in your teams dir from given tags/branches');
    console.log('BETA: Only works on OSX, sorry');
    console.log(' ');
    optimist.showHelp();
}

function _printHelp() {
    console.log('Usage:');
    console.log('  archon [clean/replay/match/kill/spawn]');
    console.log('See archon [clean/replay/match/kill/spawn] --help for more info');
}



function _runMatches() {
    var host, maps, teams, validateTeams, validateMaps;
    var teamFolder = validate.getTeamsOrSrc();
    var mapsTeams = validate.getMapsAndTeams(argv._, teamFolder);
    maps = mapsTeams[0];
    teams = mapsTeams[1];
    if (argv.m) {
        maps = validate.removeSystemFolders(fs.readdirSync('maps/'));
    }
    if (argv.t) {
        teams = validate.removeSystemFolders(fs.readdirSync(teamFolder + '/'));
    }
    maps = validate.removeNonMaps(maps);
    teams = validate.removeNonTeams(teams, teamFolder);
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
        validate.validate(validateMaps, validateTeams, argv.s, teamFolder);
    } catch (e) {
        console.log('Looks like one of the inputs is wrong!');
        console.log(' ');
        _printHelp();
        throw e;
    }
    runMatches(maps, teams, host, argv.s, argv.r, argv.e, argv.l, argv.x, argv.n, argv.c, argv.d);
}

function _clean() {
    writeCleanConf();
    writeCleanUI();
}

function cleanArgs(arr) {
    var newArr = [];
    var options = [MATCH, WATCH, CLEAN, KILL, SPAWN];
    for (var i = 0; i < arr.length; i++) {
        if (options.indexOf(arr[i]) === -1) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

(function() {
    var match = argv._.indexOf(MATCH) !== -1;
    var watch = argv._.indexOf(WATCH) !== -1;
    var clean = argv._.indexOf(CLEAN) !== -1;
    var kill = argv._.indexOf(KILL) !== -1;
    var spawn = argv._.indexOf(SPAWN) !== -1;

    var teamFolder = validate.getTeamsOrSrc();
    validate.validateFolder(teamFolder);

    if (argv.v) {
        console.log('Thanks for using archon!');
        console.log('version', require('../package.json').version);

    } else if (argv.h) {
        if (match) {
            _printMatchHelp();
        } else if (watch) {
            _printWatchHelp();
        } else if (clean) {
            _printCleanHelp();
        } else if (kill) {
            _printKillHelp();
        } else if (spawn) {
            _printSpawnHelp();
        } else {
            _printHelp();
        }
    } else if (clean) {
        console.log('Restoring default settings...');
        _clean();
        console.log('Done!');
    } else if (watch) {
        runReplays(cleanArgs(argv._))
    } else if (kill) {
        clearTeams.clear(teamFolder, function() {
            console.log("Successfully killed all spawned teams");
        });
    } else if (spawn) {
        spawnTeams.spawn(cleanArgs(argv._), argv.a, argv.b, argv.g);
    } else {
        _runMatches();
    }
}).call(this);