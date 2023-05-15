// TODO: Some test modules do not exit

// App-specific
require('./conduit.spec');
require('./attic.spec');
require('./clacks.spec');

// Specific order - in use
require('./config.spec');
require('./db.spec');
require('./enviro.spec');
require('./eventBus.spec');
require('./extract.spec');
// require('./gistSync.spec');
require('./gpio.spec');
require('./ip.spec');
require('./leds.spec');
require('./log.spec');
require('./motePhat.spec');
require('./requestAsync.spec');
require('./schema.spec');
require('./server.spec');
require('./ses.spec');
require('./textDisplay.spec');
