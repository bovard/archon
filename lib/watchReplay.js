var fs = require('fs');
var path = require('path');

var writeSkipConf = require('./writeConf').writeSkipConf;
var runReplay = require('./game').runReplay


function _getReplays(replayFolderOrFile) {
    var replays = [];
    if (typeof(replayFolderOrFile) === 'string') {
        return _getIndividualReplays(replayFolderOrFile)
    }
    for (var i = 0; i < replayFolderOrFile.length; i++) {
        if (!fs.existsSync(replayFolderOrFile[i])) {
            throw '404: ' + replayFolderOrFile[i] + ' not found!';
        }
        replays = replays.concat(_getIndividualReplays(replayFolderOrFile[i]));
    }
    return replays;
}


function _getIndividualReplays(replayFolderOrFile) {
    var i,
        j,
        files,
        stats,
        replays = [];

    stats = fs.statSync(replayFolderOrFile);
    if (stats.isDirectory()) {
        files = fs.readdirSync(replayFolderOrFile);
        for (j = 0; j < files.length; j++) {
            replays = replays.concat(_getReplays(path.join(replayFolderOrFile, files[j])));
        }
    } else if (stats.isFile()) {
        replays.push(replayFolderOrFile);
    }
    return replays;
}

function runReplays(replayFoldersOrFiles) {
    var replay;
    var replays = _getReplays(replayFoldersOrFiles);

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