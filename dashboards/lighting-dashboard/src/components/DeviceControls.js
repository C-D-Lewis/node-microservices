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
 * @param {object} props - Component props.
 * @param {string} props.align - Alignment.
 * @returns {HTMLElement}
 */
const ButtonBar = ({ align } = {}) => fabricate.Row()
  .withStyles({
    margin: '7px',
    marginTop: '10px',
    justifyContent: align === 'right' ? 'flex-end' : 'initial',
  });

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

  const buttonBarStyles = { marginLeft: '10px', marginRight: '10px' };

  return fabricate.Column()
    .addChildren([
      ButtonBar()
        .withStyles(buttonBarStyles)
        .addChildren(row1Colors.map(p =>
          SwatchButton({ backgroundColor: `rgb(${p[0]},${p[1]},${p[2]}` })
            .onClick(() => {
              websocketSendPacket(device, { to: 'visuals', topic: 'setAll', message: { all: p } });
            }),
        )),
      ButtonBar()
        .withStyles(buttonBarStyles)
        .addChildren(row2Colors.map(p =>
          SwatchButton({
            backgroundColor: `rgb(${p[0]},${p[1]},${p[2]}`,
          })
          .onClick(() => {
            websocketSendPacket(device, { to: 'visuals', topic: 'setAll', message: { all: p } });
          }),
        )),
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

  return fabricate.Column()
    .addChildren([
      ButtonBar()
        .addChildren([
          TextButton({
            label: 'Off',
            backgroundColor: 'black',
            color: 'white',
          })
            .withStyles(buttonStyle)
            .onClick(() => websocketSendPacket(device, { to: 'visuals', topic: 'off' })),
          TextButton({
            label: 'Spotify',
            backgroundColor: '#1DB954',
            color: 'white',
          })
            .withStyles(buttonStyle)
            .onClick(() => websocketSendPacket(device, { to: 'visuals', topic: 'spotify' })),
          TextButton({
            label: 'Demo',
            backgroundColor: Theme.Colors.primary,
            color: 'white',
          })
            .withStyles(buttonStyle)
            .onClick(() => websocketSendPacket(device, { to: 'visuals', topic: 'demo' })),
          TextButton({
            label: 'Night',
            backgroundColor: '#aaa',
            color: 'black',
          })
            .withStyles(buttonStyle)
            .onClick(() => {
              const message = { all: [64, 64, 64 ] };
              websocketSendPacket(device, { to: 'visuals', topic: 'setAll', message });
            }),
        ]),
    ]);
};

/**
 * DeviceControls component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device object.
 * @returns {HTMLElement}
 */
const DeviceControls = ({ device }) => fabricate.Column()
  .withStyles({ width: '100%' })
  .addChildren([
    SwatchesBar({ device }),
    FunctionsBar({ device }),
  ]);
