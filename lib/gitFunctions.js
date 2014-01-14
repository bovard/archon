
var git = require('git');
var fs = require('fs');
var path = require('path');
var winston = require('winston');


function _findPlayer() {
    var teams = fs.readdirSync('teams');
    var matches;
    var re = 'team[0-9][0-9][0-9]';
    for (var i = 0; i < teams.length; i++) {
        matches = teams[i].match(re);
        if (matches && matches.length == 1) {
            return matches[0];
        }
    }
    return null;
}

function _findPathToGitRepo() {
    var teamXXX = _findPlayer();
    if (fs.existsSync('.git')) {
        return '.';
    }
    if (fs.existsSync(path.join('teams','git'))) {
        return 'teams';
    }
    if (fs.existsSync(path.join('teams', teamXXX))) {
        return teamXXX;
    }
    return null;
}


function getTags(callback) {
    var path = _findPathToGitRepo();
    new git.Repo(path, function(err, repo) {
        if (err) {
            winston.error(err);
        }
        repo.tags(function(err, tags) {
            if (err) {
                winston.error(err);
            }
            callback(tags);

        })
    })
}


function getBrances(callback) {
    var path = _findPathToGitRepo();

}

function validate() {
    // we need a valid player and valid repo
    var player = _findPlayer();
    if (!player) {
        throw "Couldn't find a valid team of type teamXXX"
    }
    if (_findPathToGitRepo() === null) {
        throw "Couldn't find a valid git repo in ., teams/ or teams/" + player
    }
}


module.exports = {
    validate: validate
};