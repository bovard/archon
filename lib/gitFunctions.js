
var git = require('git');
var fs = require('fs');
var path = require('path');
var winston = require('winston');
var spawn = require('child_process').spawn;


var TEAMS = 'teams';
var DOT_GIT = '.git';
var REFS = 'refs';
var TAGS = 'tags';
var HEADS = 'heads';
var REMOTES = 'remotes';
var MASTER = 'master';

function _findPlayer() {
    var teams = fs.readdirSync(TEAMS);
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
    if (fs.existsSync(path.join(TEAMS,'.git'))) {
        return 'teams';
    }
    if (fs.existsSync(path.join(TEAMS, teamXXX, '.git'))) {
        return path.join(TEAMS, teamXXX);
    }
    return null;
}


function getTagsSync() {
    var pathGit = _findPathToGitRepo();
    return fs.readdirSync(path.join(pathGit, DOT_GIT, REFS, TAGS));
}


function getLocalBranchesSync() {
    var pathGit = _findPathToGitRepo();
    return fs.readdirSync(path.join(pathGit, DOT_GIT, REFS, HEADS));
}

function getRemotesSync() {
    var pathGit = _findPathToGitRepo();
    return fs.readdirSync(path.join(pathGit, DOT_GIT, REFS, REMOTES));
}

function getRemoteBranchesSync(remote) {
    var pathGit = _findPathToGitRepo();
    return fs.readdirSync(path.join(pathGit, DOT_GIT, REFS, REMOTES, remote));
}

function removeSedBackkupsFromTeam(team, callback) {
    // "find ./$folderName -name '*.bak'* -delete"
    var findRemove = spawn('find', [
        path.join(TEAMS, team),
        '-name',
        "'*.bak'*",
        '-delete'
    ]);

    findRemove.stdout.on('data', function (data) {
        winston.verbose('stdout: ' + data.toString());
    });

    findRemove.stderr.on('data', function (data) {
        winston.error('stderr: ' + data.toString());
    });

    findRemove.on('close', function (code) {
        winston.verbose('findRemove exit code ' + code);
        if (callback) {
            if (code === 0) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}

function sedRepalceTeam(oldTeam, newTeam, callback) {
    var sedRename = spawn('find', [
        path.join(TEAMS, newTeam),
        '-name',
        '*.java',
        '-type',
        'f',
        '-exec',
        'sed',
        '-i.bak',
        "s/" + oldTeam + "/" + newTeam + "/g",
        '{}',
        '+'
    ]);

    sedRename.stdout.on('data', function (data) {
        winston.verbose('stdout: ' + data.toString());
    });

    sedRename.stderr.on('data', function (data) {
        winston.error('stderr: ' + data.toString());
    });

    sedRename.on('close', function (code) {
        winston.verbose('sedRename exit code ' + code);
        if (callback) {
            if (code === 0) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });

}


function makeNewTeam(branchOrTag, remote, callback) {
    var gitPath = _findPathToGitRepo();
    var name = branchOrTag;
    while(name.indexOf('.') > -1 || name.indexOf('/') > -1) {
        name = name.replace('.','_').replace('/','_');
    }
    name = '_team' + name;
    var teamXXX = _findPlayer();
    checkout(branchOrTag, remote, gitPath, function(success) {
        if (!success) {
            winston.error('branch not checked out');
            callback(false);
            return;
        }
        copyTeam(teamXXX, name, function(success) {
            if (!success) {
                winston.error('files not copied');
                callback(false);
                return;
            }
            sedRepalceTeam(teamXXX, name, function(success) {
                if (!success) {
                    winston.error('sed failed');
                    callback(false);
                    return;
                }
                removeSedBackkupsFromTeam(name, function(success) {
                    callback(success)
                })
            })
        });
    });
}


function copyTeam(team, newTeam, callback) {
    if (fs.existsSync(path.join(TEAMS, newTeam))) {
        callback(false);
    } else {
        fs.mkdirSync(path.join(TEAMS, newTeam));
        _copyFiles(path.join(process.cwd(), TEAMS, team), path.join(process.cwd(), TEAMS, newTeam), callback);
    }

}

function _copyFiles(folder, newFolder, callback) {
    var cp = spawn('cp', ['-r', folder, newFolder]);

    cp.stdout.on('data', function (data) {
        winston.verbose('stdout: ' + data.toString());
    });

    cp.stderr.on('data', function (data) {
        winston.error('stderr: ' + data.toString());
    });

    cp.on('close', function (code) {
        winston.verbose('copyFiles exit code ' + code);
        if (callback) {
            if (code === 0) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}

function checkoutMaster(callback) {
    checkout('master', null, _findPathToGitRepo(), callback);
}

function clearChanges(callback) {
    checkout('.', null, _findPathToGitRepo(), callback);
}

function checkout(branch, remote, gitPath, callback) {
    isClean(gitPath, function(clean) {
        if(!clean) {
            winston.error("Current working branch not clean! Please stash or commit to continue");
            callback(false);
        } else {
            _checkout(branch, remote, gitPath, callback)
        }
    })
}

function _checkout(branch, remote, gitPath, callback) {
    if(remote && remote != HEADS) {
        branch = remote + '/' + branch
    }

    var gitCheckout = spawn('git', ['checkout', branch], {cwd: gitPath});

    gitCheckout.stdout.on('data', function (data) {
        winston.verbose('stdout: ' + data.toString());
    });

    gitCheckout.stderr.on('data', function (data) {
        winston.error('stderr: ' + data.toString());
    });

    gitCheckout.on('close', function (code) {
        winston.verbose('git checkout exit code ' + code);
        if (callback) {
            if (code === 0) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });

}


/**
 * Tells you if the given directory is clean
 */
function isClean(gitPath, callback) {
    gitStatus(gitPath, function(result) {
        if (result.indexOf('modified') === -1) {
            callback(true);
        } else {
            callback(false);
        }
    })
}

function gitStatus(gitPath, callback) {
    var gitStatus = spawn('git', ['status'], {cwd: gitPath});
    var result = '';

    gitStatus.stdout.on('data', function (data) {
        winston.verbose('stdout: ' + data.toString());
        result += data.toString();
    });

    gitStatus.stderr.on('data', function (data) {
        winston.error('stderr: ' + data.toString());
    });

    gitStatus.on('close', function (code) {
        winston.verbose('gitStatus exit code ' + code);
        if (callback) {
            callback(result);
        }
    });

}

function validate(callback) {
    // we need a valid player and valid repo
    var player = _findPlayer();
    var gitPath = _findPathToGitRepo();
    if (!player) {
        throw "Couldn't find a valid team of type teamXXX";
    }
    if (gitPath === null) {
        throw "Couldn't find a valid git repo in ., teams/ or teams/" + player;
    }
    isClean(gitPath, function(status) {
        if (!status) {
            throw "Looks like there are outstanding changes, stash or commit them"
        }
        callback(status);
    });
}


module.exports = {
    validate: validate,
    checkoutMaster: checkoutMaster,
    makeNewTeam: makeNewTeam,
    getTagsSync: getTagsSync,
    getLocalBranchesSync: getLocalBranchesSync,
    getRemotesSync: getRemotesSync,
    getRemoteBranchesSync: getRemoteBranchesSync
};