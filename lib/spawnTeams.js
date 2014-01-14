var gitFunctions = require('./gitFunctions');

function spawn() {
    gitFunctions.validate();

}



module.exports = {
    spawn: spawn
};
