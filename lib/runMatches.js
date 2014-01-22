var MAP = 0;
var TEAM_A = 1;
var TEAM_B = 2;

var runGame = require('./game').runGame;
var DataCollector = require('./data').DataCollector;
var request = require('request');
var path = require('path');
var winston = require('winston');

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


/**
 * Doubles the number of games by swapping every game with a and b
 * @param games
 */
function mirrorGames(games) {
    var newArr = [];
    var game;
    for (var i = 0; i < games.length; i++) {
        game = games[i];
        newArr.push(game);
        newArr.push([game[MAP], game[TEAM_B], game[TEAM_A]]);
    }
    return newArr;
}


function runMatches(maps, teams, host, series, replayFolder, csv, elo, mirror, noReplays, statsCache, doReport) {
    var games, gamesLength;
    if (host) {
        games = _generateVsWorldGames(maps, teams, host, series);
    } else {
        games = _generateRoundRobinGames(maps, teams, series);
    }

    if (mirror) {
        games = mirrorGames(games);
    }

    gamesLength = games.length;
    console.log('Running', gamesLength, 'matches on', maps.length, 'maps between', teams.length, 'teams');
    var gamesEnded = 0;

    var dataCollector = new DataCollector();

    function endGame(round, winner, map, teamA, teamB) {
        if (!series) {
            console.log(map, '[' + teamA +'/'+ teamB + ']', winner, round);
            dataCollector.addGame(map, teamA, teamB, winner, round);
        }
        if (statsCache && doReport) {
            request.post({
                uri: 'http://' + path.join(statsCache, '/game/'),
                qs: {
                    round: round,
                    winner: winner,
                    map: map,
                    teamA: teamA,
                    teamB: teamB
                }
            }, function(error, response, body) {
                if (error) {
                    winston.error(error);
                }
            })
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
                if (host) {
                    teams.push(host);
                }
                dataCollector.computeELOs(teams, series);
            }
            return;
        }

        var game = games.shift();
        // if we don't have a stats cache just start the game
        if (!statsCache) {
            computeNextGame();
        } else {
            // else check to see if we've computed it already first
            request.get({
                uri: 'http://' + path.join(statsCache, '/game/'),
                qs: {
                    teamA: game[TEAM_A],
                    teamB: game[TEAM_B],
                    map: game[MAP]
                }
            }, function(error, response, body) {
                if (error) {
                    winston.error(error);
                }
                if (body.indexOf('404') != -1) {
                    winston.info("not found, computing");
                    computeNextGame();
                } else {
                    winston.info("Found!");
                    body = JSON.parse(body);
                    endGame(body.round, body.winner, body.map, body.teamA, body.teamB);
                }
            })

        }
        function computeNextGame() {
            if (series) {
            var seriesData = dataCollector.startSeries(game[MAP], game[TEAM_A], game[TEAM_B]);
                runGame(game[MAP], game[TEAM_A], game[TEAM_B], seriesData, replayFolder, noReplays, endGame);
            } else {
                runGame(game[MAP], game[TEAM_A], game[TEAM_B], series, replayFolder, noReplays, endGame);
            }
        }

    }

    // tried starting multiple games at once but that had weird consequences
    startNextGame();
}


module.exports.runMatches = runMatches;