var fs = require('fs');
var winston = require('winston');
var path = require('path');


function validate(map_list, team_list, series, teamFolder) {
    if (map_list.length === 0) {
        throw 'ERROR: Must specify some maps (ex: maps/map1.xml)'
    }
    if (team_list.length === 0) {
        throw 'ERROR: Must specify some teams (ex: ' + teamFolder + '/team1/)'
    }
    if (series) {
        if (map_list.length % 2 === 0) {
            throw 'ERROR: Must have an odd amount of maps with the series option';
        }
    }
    validateFolder(teamFolder);
    _validateMaps(map_list);
    _validateTeams(team_list, teamFolder);
    _validateVersion();
}

function validateFolder(teamFolder) {
    var folders = fs.readdirSync('.');

    folders = _arrayToLowerCase(folders);

    if (!(folders.indexOf(teamFolder) !== -1 && folders.indexOf('maps') !== 1)) {
        throw 'ERROR: Is the current working directory the top level of the BattleCode client?'
    }
}

function _validateVersion() {
    var toFind = '<target name="headless"';
    var valid = false;
    var antBuild = fs.readFileSync('build.xml').toString().split('\n');
    antBuild.forEach(function(line) {
        if (line.indexOf(toFind) !== -1) {
            valid = true;
        }
    });
    if (!valid) {
        console.log("Error: Looks like you are trying to run archon in an old (pre-2105) battlecode install")
        console.log("Please install 2.X.X or if this is a new year, post an issue to: ")
        console.log("https://github.com/bovard/archon/issues")
        throw "ERROR";
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

function _validateTeams(team_list, teamFolder) {
    var teams = fs.readdirSync(teamFolder);
    teams.push('basicplayer');

    return _IsSubArr(team_list, teams);
}


function removeNonTeams(arr, teamFolder) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        var stat = fs.statSync(path.join(teamFolder, arr[i]));
        if (stat.isDirectory()) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

function removeNonMaps(arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].indexOf('.xml') !== -1) {
            newArr.push(arr[i]);
        }

    }
    return newArr;
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


function getTeamsOrSrc() {
    var folders = fs.readdirSync('.');

    folders = _arrayToLowerCase(folders);

    if (folders.indexOf('teams') !== -1) {
        return 'teams'
    }

    if (folders.indexOf('src') !== -1) {
        return 'src'
    }
}


function toArray(arr) {
    if (typeof(arr) === 'string') {
        arr = [arr]
    }
    return arr;
}

function getMapsAndTeams(arr, teamFolder) {
    var maps = [],
        teams = [];

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].indexOf(teamFolder) === 0) {
            teams.push(arr[i])
        } else if (arr[i].indexOf('maps') === 0) {
            maps.push(arr[i]);
        } else {
            winston.error('Ignored input ' + arr[i] + ' needs to start with maps/ or ' + teamFolder + '/');
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
    removeSystemFolders: removeSystemFolders,
    removeNonTeams: removeNonTeams,
    removeNonMaps: removeNonMaps,
    validateFolder: validateFolder,
    getTeamsOrSrc: getTeamsOrSrc
};
