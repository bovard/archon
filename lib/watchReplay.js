

var fs = require('fs');
var path = require('path');

var writeSkipConf = require('./writeConf').writeSkipConf;
var runReplay = require('./game').runReplay


function something(thing) {
}

function _getReplays(replayFolderOrFile) {
    var i, replays;
    if (!fs.existsSync(replayFolderOrFile)) {
        throw '404: ' + replayFolderOrFile + ' not found!';
    }

    if (fs.statSync(replayFolderOrFile).isDirectory()) {
        replays = fs.readdirSync(replayFolderOrFile);
        for (i = 0; i < replays.length; i++) {
            replays[i] = path.join(replayFolderOrFile, replays[i]);
        }
    } else {
        replays = [replayFolderOrFile];
    }
    return replays;
}


function runReplays(replayFoldersOrFiles) {
    var replay;
    var replays = [];
    for (var i = 0; i < replayFoldersOrFiles.length; i++) {
        replays = replays.concat(_getReplays(replayFoldersOrFiles[i]));
    }

    function _watchReplay() {
        if (replays.length === 0) {
            writeSkipConf(false);
            return;
        }
        replay = replays.shift();
        runReplay(replay, _watchReplay)
    }

    _watchReplay();
}


module.exports.runReplays = runReplays;