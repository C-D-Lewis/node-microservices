# node-common

Single repo for all the 'common' modules my Node apps use. Saves them all
maintaining their own copies.


## Additional Dependencies

Not included in `package.json` to enable installing on Mac and Linux for
testing.

* `"node-blinkt": "^1.2.1"` for blinkt phat

* `https://github.com/pimoroni/enviroplus-python/` for enviro phat


## Tests

Tests run in `test` with `npm test`. Some are stubbed when not running on ARM
(on a Pi), but should still handle this situation and all pass on Linux/Mac.

At least `conduit`, `attic`, `clacks`, and `visuals` must be running.
