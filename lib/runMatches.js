var MAP = 0;
var TEAM_A = 1;
var TEAM_B = 2;

var runGame = require('./game').runGame;
var DataCollector = require('./data').DataCollector;

var writeCleanUI = require('./writeUI').writeCleanUI;
var writeCleanConf = require('./writeConf').writeCleanConf;


function _generateRoundRobinGames(maps, teams, series) {
    var i, j, k;

    var games = [];

    if (!series) {
        for (i = 0; i < maps.length; i++) {
            for (j = 0; j < teams.length; j++) {
                for (k = j + 1; k < teams.length; k++) {
                    games.push([maps[i], teams[j], teams[k]])
                }
            }
        }
    } else {
        var map = maps.join(',');
        for (j = 0; j < teams.length; j++) {
            for (k = j + 1; k < teams.length; k++) {
                games.push([map, teams[j], teams[k]])
            }
        }
    }


    return games;
}

function _generateVsWorldGames(maps, teams, host, series) {
    var i, j;

    var games = [];

    if (!series) {
        for (i = 0; i < maps.length; i++) {
            for (j = 0; j < teams.length; j++) {
                games.push([maps[i], host, teams[j]]);
            }

        }
    } else {
        var map = maps.join(',');
        for (j = 0; j < teams.length; j++) {
            games.push([map, host, teams[j]]);
        }
    }
    return games;
}


function runMatches(maps, teams, host, series, replayFolder, csv, elo) {
    var games, gamesLength;
    if (host) {
        games = _generateVsWorldGames(maps, teams, host, series);
    } else {
        games = _generateRoundRobinGames(maps, teams, series);
    }
    gamesLength = games.length;
    var gamesEnded = 0;

    var dataCollector = new DataCollector();

    function endGame(round, winner, map, teamA, teamB) {
        if (!series) {
            console.log(map, '[' + teamA +'/'+ teamB + ']', winner, round);
            dataCollector.addGame(map, teamA, teamB, winner, round);
        }
        gamesEnded += 1;
        startNextGame();
    }


    function endMatch() {
        if (gamesEnded === gamesLength) {
            if(host) {
                dataCollector.printPlayerMapSummary(host, maps, series);
            } else {
                dataCollector.printPlayersSummary(teams);
            }
            writeCleanConf();
            writeCleanUI();
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
            if (csv) {
                dataCollector.saveAsCSV(series);
            }
            if (elo) {
                dataCollector.computeELOs(teams, series);
            }
            return;
        }

        var game = games[0];
        games.shift();
        if (series) {
            var seriesData = dataCollector.startSeries(game[MAP], game[TEAM_A], game[TEAM_B]);
            runGame(game[MAP], game[TEAM_A], game[TEAM_B], seriesData, replayFolder, endGame);
        } else {
            runGame(game[MAP], game[TEAM_A], game[TEAM_B], series, replayFolder, endGame);
        }
    }

    // tried starting multiple games at once but that had weird consequences
    startNextGame();
}


module.exports.runMatches = runMatches;