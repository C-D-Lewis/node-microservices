/** Colors for demo */
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
/** Minimal white color */
const COLOR_LOW_WHITE = [64, 64, 64];

/**
 * ButtonBar component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ButtonBar = () => fabricate('Row')
  .setStyles({ margin: '0px 7px', marginBottom: '10px' });

/**
 * SwatchesBar component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement} Fabricate component.
 */
const SwatchesBar = ({ device }) => {
  const row1Colors = DEMO_COLORS.slice(0, 5);
  const row2Colors = DEMO_COLORS.slice(6, 11);
  const row3Colors = [[255, 255, 255]];

  const buttonBarStyles = { marginLeft: '10px', marginRight: '10px' };

  /**
   * Build a sawtch button from a color.
   *
   * @param {Array<number>} rgb - Color.
   * @returns {HTMLElement} Fabricate component.
   */
  const buildButton = (rgb) => fabricate('SwatchButton', {
    backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]}`,
  })
    .onClick(() => BifrostService.sendAndClose(device, { to: 'visuals', topic: 'setAll', message: { all: rgb } }));

  return fabricate('Column')
    .setChildren([
      ButtonBar()
        .setStyles(buttonBarStyles)
        .setChildren(row1Colors.map(buildButton)),
      ButtonBar()
        .setStyles(buttonBarStyles)
        .setChildren(row2Colors.map(buildButton)),
      ButtonBar()
        .setStyles(buttonBarStyles)
        .setChildren(row3Colors.map(buildButton)),
    ]);
};

/**
 * FunctionsBar component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement} Fabricate component.
 */
const FunctionsBar = ({ device }) => {
  const buttonStyle = { flex: 1 };

  return ButtonBar()
    .setChildren([
      fabricate('TextButton', {
        label: 'Off',
        backgroundColor: 'black',
        color: 'white',
      })
        .setStyles(buttonStyle)
        .onClick(() => WsService.sendPacket(device, { to: 'visuals', topic: 'off' })),
      fabricate('TextButton', {
        label: 'Spotify',
        backgroundColor: '#1DB954',
        color: 'white',
      })
        .setStyles(buttonStyle)
        .onClick(() => WsService.sendPacket(device, { to: 'visuals', topic: 'spotify' })),
      fabricate('TextButton', {
        label: 'Demo',
        backgroundColor: Theme.colors.primary,
        color: 'white',
      })
        .setStyles(buttonStyle)
        .onClick(() => WsService.sendPacket(device, { to: 'visuals', topic: 'demo' })),
      fabricate('TextButton', {
        label: 'Night',
        backgroundColor: '#aaa',
        color: 'black',
      })
        .setStyles(buttonStyle)
        .onClick(() => {
          const message = { 0: COLOR_LOW_WHITE, 1: COLOR_LOW_WHITE, 2: COLOR_LOW_WHITE };
          WsService.sendPacket(device, { to: 'visuals', topic: 'setPixel', message });
        }),
    ]);
};

/**
 * DeviceControls component.
 */
fabricate.declare('DeviceControls', ({ device }) => fabricate('Column')
  .setStyles({ width: '100%' })
  .setChildren([
    SwatchesBar({ device }),
    FunctionsBar({ device }),
  ]));
