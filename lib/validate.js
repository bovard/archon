var fs = require('fs');
var winston = require('winston');


function validate(map_list, team_list, series) {
    if (map_list.length === 0) {
        throw 'ERROR: Must specify some maps (ex: maps/map1.xml)'
    }
    if (team_list.length === 0) {
        throw 'ERROR: Must specify some teams (ex: teams/team1/)'
    }
    if (series) {
        if (map_list.length % 2 === 0) {
            throw 'ERROR: Must have an odd amount of maps with the series option';
        }
    }
    _validateFolder();
    _validateMaps(map_list);
    _validateTeams(team_list);
}

function _validateFolder() {
    var folders = fs.readdirSync('.');

    folders = _arrayToLowerCase(folders);

    if (!(folders.indexOf('teams') !== -1 && folders.indexOf('maps') !== 1)) {
        throw 'ERROR: Is the current working directory the top level of the BattleCode client?'
    }
}


function _IsSubArr(sub_arr, arr, lower) {
    if (lower) {
        arr = _arrayToLowerCase(arr);
        sub_arr = _arrayToLowerCase(sub_arr);
    }
    for (var i = 0; i < sub_arr.length; i++) {
        if (arr.indexOf(sub_arr[i]) === -1) {
            throw 'ERROR: ' + sub_arr[i] + ' not found!';
        }
    }
}


function _validateMaps(map_list) {
    var maps = fs.readdirSync('maps/');

    return _IsSubArr(map_list, maps, true)
}

function _validateTeams(team_list) {
    var teams = fs.readdirSync('teams/');
    teams.push('basicplayer');

    return _IsSubArr(team_list, teams);
}


function removeSystemFolders(arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].indexOf('.') !== 0) {
            newArr.push(arr[i])
        }
    }
    return newArr;
}


function _arrayToLowerCase(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].toLowerCase();
    }
    return arr;
}

function stripLeadingPaths(arr) {
    var temp;
    var chars = ['/', '\\'];
    for (var i = 0; i < arr.length; i++) {
        for (var k = 0; k < chars.length; k++) {
            var char = chars[k];
            if (arr[i].indexOf(char) !== -1) {
                temp = arr[i].split(char);
                arr[i] = temp.pop();
                // support for trailing slash
                if (!arr[i]) {
                    arr[i] = temp.pop();
                }
            }

        }
    }
    return arr;
}

function toArray(arr) {
    if (typeof(arr) === 'string') {
        arr = [arr]
    }
    return arr;
}

function getMapsAndTeams(arr) {
    var maps = [],
        teams = [];

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].indexOf('teams') === 0) {
            teams.push(arr[i])
        } else if (arr[i].indexOf('maps') === 0) {
            maps.push(arr[i]);
        } else {
            winston.error('Ignored input ' + arr[i] + ' needs to start with maps/ or teams/')
        }
    }

    maps = stripLeadingPaths(maps);
    teams = stripLeadingPaths(teams);

    return [maps, teams];
}

module.exports = {
    validate: validate,
    stripLeadingPaths: stripLeadingPaths,
    toArray: toArray,
    getMapsAndTeams: getMapsAndTeams,
    removeSystemFolders: removeSystemFolders
};
