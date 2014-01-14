var gitFunctions = require('./gitFunctions');

function spawn() {
    gitFunctions.validate(function() {
        gitFunctions.makeNewTeam('0.4.2', null, function(success) {
            console.log(success);
        });
    });
}



module.exports = {
    spawn: spawn
};
