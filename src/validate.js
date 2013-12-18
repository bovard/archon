var fs = require('fs');


function validate(map_list, team_list) {
    return _validateFolder() && _validateMaps(map_list) && _validateTeams(team_list);
}

function _validateFolder() {
    var folders = fs.readdirSync('.');

    folders = _arrayToLowerCase(folders);

    return folders.indexOf('teams') !== -1 && folders.indexOf('maps') !== 1
}


function _IsSubArr(sub_arr, arr) {
    var valid = true;
    arr = _arrayToLowerCase(arr);
    sub_arr = _arrayToLowerCase(sub_arr)
    for (var i = 0; i < sub_arr.length; i++) {
        if (arr.indexOf(sub_arr[i]) === -1) {
            console.error(sub_arr[i] + ' not found!');
            valid = false;
        }
    }
    return valid
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
