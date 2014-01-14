
var git = require('git');
var fs = require('fs');
var path = require('path');
var winston = require('winston');
var spawn = require('child_process').spawn;

var REFS = 'refs';
var TAGS = 'tags';
var HEADS = 'heads';
var REMOTES = 'remotes';

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
        return '.git';
    }
    if (fs.existsSync(path.join('teams','.git'))) {
        return path.join('teams','.git');
    }
    if (fs.existsSync(path.join('teams', teamXXX, '.git'))) {
        return path.join('teams', teamXXX, '.git');
    }
    return null;
}


function getTagsSync() {
    var pathGit = _findPathToGitRepo();
    return fs.readdirSync(path.join(pathGit, REFS, TAGS));
}


function getLocalBranchesSync() {
    var pathGit = _findPathToGitRepo();
    return fs.readdirSync(path.join(pathGit, REFS, HEADS));
}

function getRemotesSync() {
    var pathGit = _findPathToGitRepo();
    return fs.readdirSync(path.join(pathGit, REFS, REMOTES));
}

function getRemoteBranchesSync(remote) {
    var path = _findPathToGitRepo();
    return fs.readdirSync(path.join(pathGit, REFS, REMOTES, remote));
}

/**
 * Tells you if the given directory is clean
 * @param callback
 */
function isClean(callback) {
    gitStatus(function(result) {
        if (result.indexOf('clean') !== -1) {
            callback(true);
        } else {
            callback(false);
        }
    })
}

function gitStatus(callback) {
    var remove = spawn('git', ['status']);
    var result = '';

    remove.stdout.on('data', function (data) {
        winston.verbose('stdout: ' + data.toString());
        result += data.toString();
        console.log('stdout: ' + data.toString());
    });

    remove.stderr.on('data', function (data) {
        winston.error('stderr: ' + data.toString());
        console.log('stderr: ' + data.toString());
    });

    remove.on('close', function (code) {
        winston.verbose('replay exit code ' + code);
        console.log('replay exit code ' + code);
        if (callback) {
            callback(result);
        }
    });

}

function validate() {
    // we need a valid player and valid repo
    var player = _findPlayer();
    if (!player) {
        throw "Couldn't find a valid team of type teamXXX";
    }
    if (_findPathToGitRepo() === null) {
        throw "Couldn't find a valid git repo in ., teams/ or teams/" + player;
    }
    if (!isClean()) {
        throw "Looks like there are outstanding changes, please stash or commit them";
    }
    console.log(getTags());
    console.log(getLocalBranches());
    console.log(getRemotes());
    gitStatus(function(code) {
        console.log(code);
    })
}


module.exports = {
    validate: validate,
    gitStatus: gitStatus,
    isClean: isClean
};