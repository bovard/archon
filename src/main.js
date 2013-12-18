var validate = require('./validate')

(function() {
    var argv = require('optimist').argv;

    if (!validate.validate(argv.maps, argv.teams)) {
        throw 'Invalid Invocation or File Not Found';
    }



}).call(this);