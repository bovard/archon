var WIN = 0;
var LOSS = 1;

var MAP = 0;
var TEAM_A = 1;
var TEAM_B = 2;

var runGame = require('./game').runGame;

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


function runMatches(maps, teams, host) {
    var games;
    if (host) {
        games = _generateVsWorldGames(maps, teams, host);
    } else {
        games = _generateRoundRobinGames(maps, teams);
    }

    var winLoss = {};
    for (var i = 0; i < teams.length; i++) {
        winLoss[teams[i]] = [0,0];
    }
    if (host) {
        winLoss[host] = [0,0];
    }

    function endGame(round, winner, map, teamA, teamB) {
        console.log(map, '[' + teamA +'/'+ teamB + ']', winner, round);
        if (winner === teamA) {
            winLoss[teamA][WIN] += 1;
            winLoss[teamB][LOSS] += 1;
        } else {
            winLoss[teamB][WIN] += 1;
            winLoss[teamA][LOSS] += 1;
        }

        startNextGame();
    }


    function startNextGame() {
        if (games.length === 0) {
            _printSummary(winLoss);
            return;
        }

        var game = games[0];
        games.shift();
        runGame(game[MAP], game[TEAM_A], game[TEAM_B], endGame);
    }

    startNextGame();
}


function _printSummary(winLoss) {
    for (var team in winLoss) {
        var per = Math.floor(winLoss[team][WIN]/(winLoss[team][LOSS] + winLoss[team][WIN])*100);
        console.log(team, winLoss[team][WIN], winLoss[team][LOSS], per);
    }
}

module.exports.runMatches = runMatches;