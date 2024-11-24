import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types.ts';
import { sendConduitPacket } from '../services/conduitService.ts';
import { AppAreaContainer, AppAreaContainerTitle } from './AppAreaContainer.ts';

declare const fabricate: Fabricate<AppState>;

/** Colors for demo */
const DEMO_COLORS = [
  [0, 0, 0],        // Black
  [64, 64, 64],     // Grey
  [255, 255, 255],  // White
  [255, 0, 0],      // Red
  [255, 127, 0],    // Orange
  [255, 255, 0],    // Yellow
  [127, 255, 0],    // Lime green
  [0, 255, 0],      // Green
  [0, 255, 127],    // Pastel green
  [0, 255, 255],    // Cyan
  [0, 127, 255],    // Sky blue
  [0, 0, 255],      // Blue
  [127, 0, 255],    // Purple
  [255, 0, 255],    // Pink
  [255, 0, 127],    // Hot pink
];

/**
 * SwatchButton component.
 *
 * @param {object} props - Component props.
 * @param {number[]} props.color - RGB color.
 * @returns {HTMLElement} Fabricate component.
 */
const SwatchButton = ({ color }: { color: number[] }) => {
  const [red, green, blue] = color;

  const backgroundColor = `rgb(${red},${green},${blue}`;

  return fabricate('Row')
    .setStyles({
      width: '30px',
      height: '30px',
      backgroundColor,
      margin: '3px',
      cursor: 'pointer',
    })
    .onClick((el, state) => {
      const message = { all: [red, green, blue] };
      sendConduitPacket(state, { to: 'visuals', topic: 'setAll', message });
    });
};

/**
 * Color palette component.
 *
 * @returns {FabricateComponent} ColorPalette component.
 */
const ColorPalette = () => fabricate('Row')
  .setStyles(({ palette }) => ({
    flexWrap: 'wrap',
    width: 'fit-content',
    border: `solid 1px ${palette.grey6}`,
  }))
  .setNarrowStyles({ width: '100%' })
  .onCreate(async (el, state) => {
    const { message } = await sendConduitPacket(state, { to: 'visuals', topic: 'hasLights' });

    if (message && message.hasLights) {
      el.setChildren(DEMO_COLORS.map((color) => SwatchButton({ color })));
    } else {
      el.setChildren([
        fabricate('Text')
          .setStyles(({ fonts }) => ({
            color: 'white',
            fontSize: '0.9rem',
            fontFamily: fonts.body,
          }))
          .setText('No lights available'),
      ]);
    }
  });

/**
 * VisualsPalette component.
 *
 * @returns {FabricateComponent} VisualsPalette.
 */
const VisualsPalette = () => AppAreaContainer()
  .setChildren([
    AppAreaContainerTitle()
      .setText('Lighting Palette'),
    ColorPalette(),
  ]);

export default VisualsPalette;
