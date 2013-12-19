
var spawn = require('child_process').spawn;
var winston = require('winston');

var writeConf = require('./writeConf').writeConf;


var ROUND = 'Round';
var A_WINS = '(A) wins';
var B_WINS = '(B) wins';

function runGame(map, teamA, teamB, callback) {

    // write the bc.conf file to use the correct map and teams.
    writeConf(map, teamA, teamB);

    var round = 0;
    var winner;

    // after we've written the bc.conf kick off the game!
    var game = spawn('ant',
        [
            'file'
        ]
    );

    game.stdout.on('data', function (data) {
        // update the round if it's in there
        data = data.toString();
        if (data.indexOf(ROUND) !== -1) {
            var split = data.split(':')
            round = parseInt(split[1]);
            winston.debug('Round ' + round)
        }
        // A is the winner!
        if (data.indexOf(A_WINS) !== -1) {
            winner = teamA;
            winston.debug(winner + ' wins!')
        }
        // B is the winner!
        if (data.indexOf(B_WINS) !== -1) {
            winner = teamB;
            winston.debug(winner + ' wins!')
        }
        winston.verbose('stdout: ' + data);
    });

    game.stderr.on('data', function (data) {
        data = data.toString();
        winston.error('stderr: ' + data);
    });

    game.on('close', function (code) {
        winston.verbose('game exit code ' + code);
        if (callback) {
            callback(round, winner, map, teamA, teamB);
        }
    });


}



module.exports.runGame = runGame;
