
var validate = require('./validate');
var argv = require('optimist').argv;
var game = require('./game');

(function() {
    console.log(argv.maps);
    console.log(argv.teams);
    var host, maps, teams;
    maps = argv.maps;
    teams = argv.teams;
    host = argv.host;
    if (argv.host) {
        host = validate.stripLeadingPaths(argv.host);
    }
    maps = validate.stripLeadingPaths(maps);
    teams = validate.stripLeadingPaths(teams);
    console.log(maps);
    console.log(teams);

    if (!validate.validate(maps, teams)) {
        throw 'Invalid Invocation or File Not Found';
    }

    function callback(round, winner) {
        throw winner + ' won after round ' + round;
    }

    game.runGame(maps[0], teams[0], teams[1])

}).call(this);