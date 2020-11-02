const { leds, conduit, math } = require('../node-common')(['leds', 'conduit', 'math']);
const handles = require('../modules/handles');

/** Demo color change interval */
const DEMO_INTERVAL_S = 30;
/** Colors used in the 'demo' mode */
const DEMO_COLORS = [
  [255, 0, 0],    // Red
  [255, 127, 0],  // Orange
  [255, 255, 0],  // Yellow
  [127, 255, 0],  // Lime green
  [0, 255, 0],    // Green
  [0, 255, 127],  // Pastel green
  [0, 255, 255],  // Cyan
  [0, 127, 255],  // Sky blue
  [0, 0, 255],    // Blue
  [127, 0, 255],  // Purple
  [255, 0, 255],  // Pink
  [255, 0, 127],  // Hot pink
];

const { randomInt } = math;
let currentDemoColorIndex;

/**
 * Fade to the next demo color.
 */
const nextDemoColor = () => {
  let nextColorIndex = currentDemoColorIndex;
  while (nextColorIndex === currentDemoColorIndex) {
    nextColorIndex = randomInt(0, DEMO_COLORS.length);
  }

  leds.fadeAll(DEMO_COLORS[nextColorIndex]);
  currentDemoColorIndex = nextColorIndex;
};

/**
 * Handle a 'demo' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleDemoPacket = async (packet, res) => {
  if (handles['demo']) {
    conduit.respond(res, { status: 200, message: { content: 'Already doing demo' } });
    return;
  }

  // Set up the animation cycle
  handles['demo'] = setInterval(nextDemoColor, DEMO_INTERVAL_S * 1000);

  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleDemoPacket;
