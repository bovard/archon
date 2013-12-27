var fs = require('fs');
var path = require('path');

var BC_UI_FILE = [
    '#ui options',
    'analyzeFile=false',
    'glclient=false',
    'showMinimap=false',
    'choice=FILE',
    'save=false',
    'maps=null',
    'save-file=',
    'lastVersion=2014.0.0.0',
    'host=',
    'lockstep=false',
];

var FILE = 'file=';
var FILENAME = '.battlecode.ui';

function _resolveFileName(replayFile) {
    if (fs.existsSync(replayFile)) {
        return replayFile;
    }
    if (fs.existsSync(path.join(__dirname, replayFile))) {
        return path.join(__dirname, replayFile)
    }
    throw '404: ' + replayFile + ' not found!';
}

function writeUI(replayFile) {
    var uiFileContents = BC_UI_FILE.join('\n');
    uiFileContents += '\n' + FILE + _resolveFileName(replayFile);
    fs.writeFileSync(path.join(_getUserHome(), FILENAME), uiFileContents);
}

function writeCleanUI() {
    fs.unlinkSync(path.join(_getUserHome(), FILENAME));
}

function _getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

module.exports = {
    writeUI: writeUI,
    writeCleanUI: writeCleanUI
};