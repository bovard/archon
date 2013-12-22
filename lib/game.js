var spawn = require('child_process').spawn;
var winston = require('winston');

var writeConf = require('./writeConf').writeConf;

var ROUND = '[java] Round:';
var A_WINS = '(A) wins';
var B_WINS = '(B) wins';
var PLAYER_NOT_FOUND = '[java] Illegal class:';
var BAD_MAP = '[java] Malformed map file:';

function runGame(map, teamA, teamB, series, callback) {

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
        var lines = data.split('\n');
        // sometimes we get a lot of lines... first split by new line, then find the round again
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];

            if (line.indexOf(ROUND) !== -1) {
                var split = line.split(':');
                round = parseInt(split[1]);
                winston.debug('Round ' + round)
            }

            if (line.indexOf(PLAYER_NOT_FOUND) !== -1) {
                throw line;
            }

            if (line.indexOf(BAD_MAP) !== -1) {
                throw line;
            }

            // A is the winner!
            if (line.indexOf(A_WINS) !== -1) {
                winner = teamA;
                winston.debug(winner + ' wins!');
                if (series) {
                    series.addGame(winner, round);
                    round = 0;
                }
            }
            // B is the winner!
            else if (line.indexOf(B_WINS) !== -1) {
                winner = teamB;
                winston.debug(winner + ' wins!');
                if (series) {
                    series.addGame(winner, round);
                    round = 0;
                }
            }

        }

        winston.verbose('stdout: ' + data);
    });

    game.stderr.on('data', function (data) {
        data = data.toString();
        winston.error('stderr: ' + data);
    });

    game.on('close', function (code) {
        winston.verbose('game exit code ' + code);
        if (series) {
            series.endSeries();
        }
        if (callback) {
            callback(round, winner, map, teamA, teamB);
        }
    });
}


module.exports.runGame = runGame;
