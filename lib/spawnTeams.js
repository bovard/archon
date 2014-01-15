var gitFunctions = require('./gitFunctions');

function spawn(teams, all_local, all_remote, all_tags) {
    if (all_local) {
        teams = teams.concat(gitFunctions.getLocalBranchesSync());
    }
    if (all_remote) {
        var remotes = gitFunctions.getRemotesSync();
        for(var i = 0; i < remotes.length; i++) {
            teams = teams.concat(gitFunctions.getRemoteBranchesSync(remotes[i]));
        }
    }
    if (all_tags) {
        teams = teams.concat(gitFunctions.getTagsSync());
    }
    gitFunctions.validate(function() {
        console.log('Spawning', teams.length, 'teams');

        function next() {
            if (teams.length > 0) {
                var team = teams.shift();
                console.log('  spawning', team);
                gitFunctions.makeNewTeam(team, null, function(success) {
                    if (success) {
                        console.log('    success');
                    } else {
                        console.log('    failed');
                    }
                    next();
                });
            } else {
                gitFunctions.checkoutMaster(function(success) {
                    console.log('done!');
                });
            }
        }

        next();
    });
}


module.exports = {
    spawn: spawn
};
