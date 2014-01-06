var fs = require('fs');

var elo = require('./elo');

var WIN = 0;
var LOSS = 1;

var Game = function(map, teamA, teamB, winner, round) {
    this.map = map;
    this.teamA = teamA;
    this.teamB = teamB;
    this.winner = winner;
    this.round = round;
};

Game.prototype = {
    printGame: function() {
        console.log(' ', this.map, '[' + this.teamA +'/'+ this.teamB + ']', this.winner, this.round);
    }
};

var Series = function(map_list, teamA, teamB) {
    this.maps = map_list.split(',');
    this.games = [];
    this.teamA = teamA;
    this.teamB = teamB;
    this.teamAWins = 0;
    this.teamBWins = 0;
    this.mapIndex = 0;
};

Series.prototype = {
    addGame: function(winner, round) {
        this.games.push(new Game(this.maps[this.mapIndex], this.teamA, this.teamB, winner, round));
        this.mapIndex += 1;
    },
    endSeries: function() {
        for (var i = 0; i < this.games.length; i++) {
            if (this.games[i].winner === this.teamA) {
                this.teamAWins += 1;
            } else {
                this.teamBWins += 1;
            }
        }
        if (this.teamAWins > this.teamBWins) {
            this.winner = this.teamA;
        } else {
            this.winner = this.teamB;
        }
        this._printSeries();
    },
    _printSeries: function() {
        console.log('Series:', this.teamA, this.teamB, this.maps.join(','));
        var numGames = this.games.length;
        for (var i = 0; i < numGames; i++) {
            this.games[i].printGame();
        }
        if (this.winner === this.teamA) {
            console.log(this.teamA, 'wins the series', this.teamAWins, this.teamBWins)
        } else {
            console.log(this.teamB, 'wins the series', this.teamBWins, this.teamAWins)
        }
        console.log(' ')
    }
};


var DataCollector = function() {

};


DataCollector.prototype = {
    _entries: [],
    addGame: function(map, teamA, teamB, winner, round) {
        this._entries.push(new Game(map, teamA, teamB, winner, round));
    },
    startSeries: function(map_list, teamA, teamB) {
        var series = new Series(map_list, teamA, teamB);
        this._entries.push(series);
        return series;

    },
    printPlayersSummary: function(teams) {
        var i;
        var winLoss = {};
        for (i=0; i < teams.length; i++) {
            winLoss[teams[i]] = [0,0]
        }
        for (i=0; i < this._entries.length; i++) {
            var entry = this._entries[i];
            if (entry.winner === entry.teamA) {
                winLoss[entry.teamA][WIN] += 1;
                winLoss[entry.teamB][LOSS] += 1;
            } else {
                winLoss[entry.teamA][LOSS] += 1;
                winLoss[entry.teamB][WIN] += 1;
            }
        }
        console.log('');
        console.log('Summary:');
        for (var team in winLoss) {
            var per = Math.floor(winLoss[team][WIN] / (winLoss[team][LOSS] + winLoss[team][WIN])*100);
            console.log(team, '\t', winLoss[team][WIN], winLoss[team][LOSS], per);
        }
    },
    _getGames: function(series) {
        var games = [];

        if (series) {
            for (i = 0; i < this._entries.length; i++) {
                games = games.concat(this._entries[i].games);
            }
        } else {
            games = this._entries;
        }
        return games;
    },
    printPlayerMapSummary: function(team, maps, series) {
        _printPlayerMapSummary(team, maps, _getGames(series));
    },
    reset: function() {
        this._entries = [];
    },
    saveAsCSV: function(series) {
        var game;
        var games = this._getGames(series);
        var csv = '';
        for (var i = 0; i < games.length; i++) {
            game = games[i];
            csv += [game.map, game.teamA, game.teamB, game.winner, game.round].join(',') + '\n';
        }
        fs.writeFileSync('games.csv', csv);
        console.log('');
        console.log('Games saved to ./games.csv');
    },
    computeELOs: function(teams, series) {
        var team, game, i, aELO, bELO;
        var games = this._getGames(series);
        var teamELO = {};
        for (i = 0; i < teams.length; i++) {
            teamELO[teams[i]] = 1400;
        }

        for (i = 0; i < games.length; i++) {
            game = games[i];
            if (teams.indexOf(game.teamA) !== -1 && teams.indexOf(game.teamB) !== -1) {
                aELO = teamELO[game.teamA];
                bELO = teamELO[game.teamB];

                teamELO[game.teamA] = elo.calculate_new_elo(aELO, bELO, game.winner === game.teamA);
                teamELO[game.teamB] = elo.calculate_new_elo(bELO, aELO, game.winner === game.teamB);
            }
        }

        console.log(' ');
        console.log('Relative ELOs');
        for (i = 0; i < teams.length; i++) {
            team = teams[i];
            console.log(team, '\t', teamELO[team]);
        }
    }

};

function _printPlayerMapSummary(team, maps, games) {
    var i, j;
    var mapWinLoss = {};
    for (i=0; i < maps.length; i++) {
        mapWinLoss[maps[i]] = [0,0];
    }

    console.log('Wins on maps for team ' + team);
    for (i = 0; i < games.length; i++) {
        var game = games[i];
        if (game.teamA === team || game.teamB === team) {
            if (game.winner === team) {
                mapWinLoss[game.map][WIN] += 1;
            } else {
                mapWinLoss[game.map][LOSS] += 1;
            }
        }
    }
    console.log('');
    console.log('Summary:');
    for (var map in mapWinLoss) {
        var per = Math.floor(mapWinLoss[map][WIN] / (mapWinLoss[map][WIN] + mapWinLoss[map][LOSS])*100);
        console.log(map, '\t', mapWinLoss[map][WIN], mapWinLoss[map][LOSS], per);
    }

}

module.exports.DataCollector = DataCollector;