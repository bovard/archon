
function calculate_new_elo(elo, opponent_elo, win) {
    var expected = _calc_expected(elo, opponent_elo);
    var new_elo = _updated_elo(elo, expected, win);

    // enforce minimum elo
    if (new_elo < 100) {
        new_elo = 100;
    }
    return new_elo
}

function _calc_expected(elo, opponent_elo) {
    return 1.0/(1.0 + Math.pow(10.0,(opponent_elo - elo)/400.0));
}


function _updated_elo(elo, expected, win) {
    var won = 0;
    if (win) {
        won = 1;
    }
    return Math.round(Math.floor(elo + 32.0 * (won - expected)))
}

module.exports.calculate_new_elo = calculate_new_elo;
