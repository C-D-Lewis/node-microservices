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

/**
 * ButtonBar component.
 *
 * @returns {HTMLElement}
 */
const ButtonBar = () => fabricate('Row')
  .setStyles({ margin: '0px 7px', marginBottom: '10px' });

/**
 * SwatchesBar component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement}
 */
const SwatchesBar = ({ device }) => {
  const row1Colors = DEMO_COLORS.slice(0, 5);
  const row2Colors = DEMO_COLORS.slice(6, 11);
  const row3Colors = [[255, 255, 255]];

  const buttonBarStyles = { marginLeft: '10px', marginRight: '10px' };

  const buildButton = (p) => fabricate('SwatchButton', { backgroundColor: `rgb(${p[0]},${p[1]},${p[2]}` })
    .onClick(() => WsService.sendPacket(device, { to: 'visuals', topic: 'setAll', message: { all: p } }));

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
 * @returns {HTMLElement}
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
          const message = { all: [64, 64, 64] };
          WsService.sendPacket(device, { to: 'visuals', topic: 'setAll', message });
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
