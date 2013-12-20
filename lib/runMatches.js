var WIN = 0;
var LOSS = 1;

var MAP = 0;
var TEAM_A = 1;
var TEAM_B = 2;

var runGame = require('./game').runGame;
var DataCollector = require('./data').DataCollector;

function _generateRoundRobinGames(maps, teams) {
    var i, j, k;

    var games = [];

    for (i = 0; i < maps.length; i++) {
        for (j = 0; j < teams.length; j++) {
            for (k = j + 1; k < teams.length; k++) {
                games.push([maps[i], teams[j], teams[k]])
            }
        }
    }

    return games;
}

function _generateVsWorldGames(maps, teams, host) {
    var i, j;

    var games = [];

    for (i = 0; i < maps.length; i++) {
        for (j = 0; j < teams.length; j++) {
            games.push([maps[i], host, teams[j]]);
        }

    }
    return games;
}


function runMatches(maps, teams, host, cores) {
    var games, gamesLength;
    if (host) {
        games = _generateVsWorldGames(maps, teams, host);
    } else {
        games = _generateRoundRobinGames(maps, teams);
    }
    gamesLength = games.length;

    var dataCollector = new DataCollector();

    function endGame(round, winner, map, teamA, teamB) {
        console.log(map, '[' + teamA +'/'+ teamB + ']', winner, round);
        dataCollector.addGame(map, teamA, teamB, winner, round);
        startNextGame();
    }


    function endMatch() {
        if (dataCollector.getNumGames() === gamesLength) {
            if(host) {
                dataCollector.printPlayerMapSummary(host, maps);
            } else {
                dataCollector.printPlayersSummary(teams);
            }
        } else {
            setTimeout(endMatch, 2000);
        }
    }


    var calledEndMatch = false;
    function startNextGame() {
        if (games.length === 0) {
            if (!calledEndMatch) {
                calledEndMatch = true;
                endMatch();
            }
            return;
        }

        var game = games[0];
        games.shift();
        runGame(game[MAP], game[TEAM_A], game[TEAM_B], endGame);
    }

    for (var i = 0; i < cores; i++) {
        startNextGame();
    }
}


module.exports.runMatches = runMatches;