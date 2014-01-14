var fs = require('fs');
var path = require('path');
var winston = require('winston');
var spawn = require('child_process').spawn;


function _getTeamsToDelete() {
    var teams = fs.readdirSync('teams/');
    var toRemove = [];
    for (var i = 0; i < teams.length; i++) {
        if (teams[i].indexOf('_') === 0) {
            toRemove.push(teams[i]);
        }
    }
    return toRemove;
}

function _deletePlayer(player, callback) {
    console.log('Killing ' + player);
    var remove = spawn('rm', ['-rf', path.join('teams/', player)]);

    remove.stdout.on('data', function (data) {
        winston.verbose('stdout: ' + data.toString());
    });

    remove.stderr.on('data', function (data) {
        winston.error('stderr: ' + data.toString());
    });

    remove.on('close', function (code) {
        winston.verbose('replay exit code ' + code);
        if (callback) {
            callback(code);
        }
    });
}

function clear(callback) {
    var toRemove = _getTeamsToDelete();

    function _removeNext() {
        if (toRemove.length === 0) {
            console.log("Removed spawned players");
            callback();
            return;
        }

        _deletePlayer(toRemove.shift(), _removeNext);
    }
    _removeNext();
}


module.exports.clear = clear;