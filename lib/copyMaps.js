var fs = require('fs');
var yauzl = require('yauzl');
var winston = require('winston');
var path = require('path');

var SOURCE_FILE = 'lib/battlecode.jar';
var MAP_FILE_REGEX = /^battlecode\/world\/resources\/(.*\.xml)$/;

var TARGET_FOLDER = 'maps';

function copyMaps() {
    yauzl.open(SOURCE_FILE, {lazyEntries: true}, function(err, zip) {
        if (err) throw err;

        try {
            var stats = fs.statSync(TARGET_FOLDER);
            if (!stats.isDirectory) {
                throw TARGET_FOLDER + path.sep + " is not a directory, can't copy maps";
            }
        } catch (e) {
            console.log('Creating map directory');
            fs.mkdirSync(TARGET_FOLDER);
        }
        
        // Start reading entries (yauzl has a slightly odd API)
        zip.readEntry();

        zip.on('entry', function(entry) {
            var match = MAP_FILE_REGEX.exec(entry.fileName);

            if (match !== null) {
                console.log('Copying map: '+match[1]);

                zip.openReadStream(entry, function(err, stream) {
                    stream.pipe(fs.createWriteStream(path.join(TARGET_FOLDER, match[1])));
                    stream.on('end', function() {
                        // Read the next entry
                        zip.readEntry();
                    });
                });
            } else {
                // Read the next entry
                zip.readEntry();
            }
        });
    });

}

module.exports = copyMaps;
