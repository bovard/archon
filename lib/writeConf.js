var fs = require('fs');
var path = require('path');

var FILE_NAME = 'bc.conf';
var REPLAY_FOLDER = 'replays/';

var CONF_FILE = [
    'bc.server.throttle=yield',
    'bc.server.throttle-count=50',

    'bc.engine.debug-methods=false',
    'bc.engine.silence-a=true',
    'bc.engine.silence-b=true',
    'bc.engine.gc=false',
    'bc.engine.gc-rounds=50',
    'bc.engine.upkeep=true',
    'bc.engine.breakpoints=false',
    'bc.engine.bytecodes-used=true',

    'bc.client.opengl=false;',
    'bc.client.use-models=true',
    'bc.client.renderprefs2d=',
    'bc.client.renderprefs3d=',
    'bc.client.sound-on=true',
    'bc.client.check-updates=false',
    'bc.client.viewer-delay=50',

    'bc.server.transcribe-input=matches\\match.rms',
    'bc.server.transcribe-output=matches\\transcribed.txt',

];

var MAP_CONF = 'bc.game.maps=';
var TEAM_A_CONF = 'bc.game.team-a=';
var TEAM_B_CONF = 'bc.game.team-b=';
var SAVE_FILE = 'bc.server.save-file=';
var SKIP_DIALOG = 'bc.dialog.skip=';

function _getReplayName(map, teamA, teamB, replayFolder) {
    // we'll save the map as timestamp_teamA_teamB_map (leave off the map if there are multiple)
    var name;
    var ts = Math.round((new Date()).getTime() / 1000) % 10000000;
    if (map.indexOf(',') !== -1) {
        name = SAVE_FILE + path.join(replayFolder, ts + '_' + teamA + '_' + teamB + '.rms');
    } else {
        name = SAVE_FILE + path.join(replayFolder, ts + '_' + teamA + '_' + teamB + '_' + map.slice(0, -4) + '.rms');
    }
    return name;
}

function writeConf(map, teamA, teamB, replayFolder) {
    var confFileContents = CONF_FILE.join('\n');

    confFileContents += '\n' + MAP_CONF + map;
    confFileContents += '\n' + TEAM_A_CONF + teamA;
    confFileContents += '\n' + TEAM_B_CONF + teamB;
    confFileContents += '\n' + _getReplayName(map, teamA, teamB, replayFolder);

    fs.writeFileSync(FILE_NAME, confFileContents);
}

function writeSkipConf(trueFalse) {
    var confFileContents = CONF_FILE.join('\n');
    confFileContents += '\n' + SKIP_DIALOG + trueFalse;
    fs.writeFileSync(FILE_NAME, confFileContents);
}

function writeCleanConf() {
    var confFileContents = CONF_FILE.join('\n');
    fs.writeFileSync(FILE_NAME, confFileContents);
}

module.exports = {
    writeConf: writeConf,
    writeSkipConf: writeSkipConf,
    writeCleanConf: writeCleanConf
};