const { send } = require('./conduit');

/**
 * Set all LEDs off.
 */
const off = async () => {
  const packet = {
    to: 'visuals',
    topic: 'off',
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  console.log('LEDs turned off');
};

/**
 * Demo mode.
 */
const demo = async () => {
  const packet = {
    to: 'visuals',
    topic: 'demo',
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  console.log('Demo mode started');
};

/**
 * Spotify mode.
 */
const spotify = async () => {
  const packet = {
    to: 'visuals',
    topic: 'spotify',
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  console.log('Spotify mode started');
};

/**
 * Set all LEDs to a color.
 *
 * @param {string} r - Red value.
 * @param {string} g - Green value.
 * @param {string} b - Blue value.
 */
const setAll = async (r, g, b) => {
  const packet = {
    to: 'visuals',
    topic: 'setAll',
    message: { all: [parseInt(r, 10), parseInt(g, 10), parseInt(b, 10)] },
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  console.log(`All LEDs set to ${r} ${g} ${b}`);
};

/**
 * Fade all LEDs to a color.
 *
 * @param {string} r - Red value.
 * @param {string} g - Green value.
 * @param {string} b - Blue value.
 */
const fadeAll = async (r, g, b) => {
  const packet = {
    to: 'visuals',
    topic: 'fadeAll',
    message: { to: [parseInt(r, 10), parseInt(g, 10), parseInt(b, 10)] },
  };
  const res = await send({ packet });
  if (res.status !== 200) throw new Error(JSON.stringify(res));

  console.log(`All LEDs faded to ${r} ${g} ${b}`);
};

module.exports = {
  firstArg: 'visuals',
  description: 'Work with the visuals app.',
  operations: {
    off: {
      /**
       * Set all LEDs off.
       *
       * @returns {Promise<void>}
       */
      execute: async () => off(),
      pattern: 'off',
    },
    demo: {
      /**
       * Start demo mode.
       *
       * @returns {Promise<void>}
       */
      execute: async () => demo(),
      pattern: 'demo',
    },
    spotify: {
      /**
       * Start Spotify mode.
       *
       * @returns {Promise<void>}
       */
      execute: async () => spotify(),
      pattern: 'spotify',
    },
    setAll: {
      /**
       * Set all LEDs to a color.
       *
       * @returns {Promise<void>}
       */
      execute: async ([, r, g, b]) => setAll(r, g, b),
      pattern: 'set-all $r $g $b',
    },
    fadeAll: {
      /**
       * Fade all LEDs to a color.
       *
       * @returns {Promise<void>}
       */
      execute: async ([, r, g, b]) => fadeAll(r, g, b),
      pattern: 'fade-all $r $g $b',
    },
  },
};
