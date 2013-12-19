var fs = require('fs');

var FILE_NAME = 'bc.conf';

var CONF_FILE = [
    'bc.server.throttle=yield',
    'bc.server.throttle-count=50',

    'bc.engine.debug-methods=false',
    'bc.engine.silence-a=false',
    'bc.engine.silence-b=false',
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
    'bc.client.check-updates=true',
    'bc.client.viewer-delay=50',

    'bc.server.save-file=match.rms',

    'bc.server.transcribe-input=matches\\match.rms',
    'bc.server.transcribe-output=matches\\transcribed.txt',
]

var MAP_CONF = 'bc.game.maps=';
var TEAM_A_CONF = 'bc.game.team-a=';
var TEAM_B_CONF = 'bc.game.team-b=';

function writeConf(map, teamA, teamB) {
    var confFileContents = CONF_FILE.join('\n');
    confFileContents += '\n' + MAP_CONF + map;
    confFileContents += '\n' + TEAM_A_CONF + teamA;
    confFileContents += '\n' + TEAM_B_CONF + teamB;

    fs.writeFileSync(FILE_NAME, confFileContents);
}

module.exports.writeConf = writeConf;