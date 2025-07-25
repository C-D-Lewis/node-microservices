// TODO: Some test modules do not exit

// Tests for node-common modules pretend to be an app
process.env.TEST_APP_NAME = 'testApp';

// App-specific
require('./conduit.spec');
require('./attic.spec');
require('./clacks.spec');

// Specific order - in use
require('./config.spec');
require('./csv.spec');
require('./db.spec');
require('./enviro.spec');
require('./extract.spec');
// require('./gistSync.spec');
require('./gpio.spec');
require('./ip.spec');
require('./leds.spec');
require('./log.spec');
require('./motePhat.spec');
require('./requestAsync.spec');
require('./s3.spec');
require('./schema.spec');
require('./server.spec');
require('./ses.spec');
require('./textDisplay.spec');
