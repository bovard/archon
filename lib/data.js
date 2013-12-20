var WIN = 0;
var LOSS = 1;

var Game = function(map, teamA, teamB, winner, round) {
    this.map = map;
    this.teamA = teamA;
    this.teamB = teamB;
    this.winner = winner;
    this.round = round;
};



var DataCollector = function() {

};


DataCollector.prototype = {
    _games: [],
    addGame: function(map, teamA, teamB, winner, round) {
        this._games.push(new Game(map, teamA, teamB, winner, round));
    },
    printPlayersSummary: function(teams) {
        var i;
        var winLoss = {};
        for (i=0; i < teams.length; i++) {
            winLoss[teams[i]] = [0,0]
        }
        for (i=0; i < this._games.length; i++) {
            var game = this._games[i];
            if (game.winner === game.teamA) {
                winLoss[game.teamA][WIN] += 1;
                winLoss[game.teamB][LOSS] += 1;
            } else {
                winLoss[game.teamA][LOSS] += 1;
                winLoss[game.teamB][WIN] += 1;
            }
        }
        console.log('Summary:');
        for (var team in winLoss) {
            var per = Math.floor(winLoss[team][WIN] / (winLoss[team][LOSS] + winLoss[team][WIN])*100);
            console.log(team, winLoss[team][WIN], winLoss[team][LOSS], per);
        }
    },
    getNumGames: function() {
        return this._games.length;
    },
    printPlayerMapSummary: function(team, maps) {
        var i;
        var mapWinLoss = {};
        for (i=0; i < maps.length; i++) {
            mapWinLoss[maps[i]] = [0,0];
        }
        for (i = 0; i < this._games.length; i++) {
            var game = this._games[i];
            if (game.teamA === team || game.teamB === team) {
                if (game.winner === team) {
                    mapWinLoss[game.map][WIN] += 1;
                } else {
                    mapWinLoss[game.map][LOSS] += 1;
                }
            }
        }
        console.log('Summary:');
        for (var map in mapWinLoss) {
            var per = Math.floor(mapWinLoss[map][WIN] / (mapWinLoss[map][WIN] + mapWinLoss[map][LOSS])*100);
            console.log(map, mapWinLoss[map][WIN], mapWinLoss[map][LOSS], per);
        }
    },
    reset: function() {
        this._games = [];
    }

};

module.exports.DataCollector = DataCollector;