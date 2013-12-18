var fs = require('fs');


function validate(map_list, team_list) {
    if (map_list.length === 0) {
        throw 'ERROR: Must specify some --maps'
    }
    if (team_list.length === 0) {
        throw 'ERROR: Must specify some --teams'
    }
    return _validateFolder() && _validateMaps(map_list) && _validateTeams(team_list);
}

function _validateFolder() {
    var folders = fs.readdirSync('.');

    folders = _arrayToLowerCase(folders);

    if (!(folders.indexOf('teams') !== -1 && folders.indexOf('maps') !== 1)) {
        throw 'ERROR: Is the current working directory the top level of the BattleCode client?'
    }
}


function _IsSubArr(sub_arr, arr) {
    arr = _arrayToLowerCase(arr);
    sub_arr = _arrayToLowerCase(sub_arr)
    for (var i = 0; i < sub_arr.length; i++) {
        if (arr.indexOf(sub_arr[i]) === -1) {
            throw 'ERROR: ' + sub_arr[i] + ' not found!';
        }
    }
}


function _validateMaps(map_list) {
    var valid, i;
    var maps = fs.readdirSync('maps/');

    return _IsSubArr(map_list, maps)
}

function _validateTeams(team_list) {
    var i, valid;
    var teams = fs.readdirSync('teams/');
    teams.append('basicplayer');

    return _IsSubArr(team_list, teams);
}


function _arrayToLowerCase(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].toLowerCase();
    }
    return arr;
}

exports.validate = validate;
