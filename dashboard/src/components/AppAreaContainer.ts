import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * AppArea item container.
 *
 * @returns {FabricateComponent} AppAreaContainer component.
 */
export const AppAreaContainer = () => fabricate('Column')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey2,
    border: `solid 2px ${palette.grey6}`,
    margin: '30px',
  }))
  .setNarrowStyles({ margin: '15px' });

/**
 * AppAreaContainer title.
 *
 * @returns {FabricateComponent} AppAreaContainerTitle component.
 */
export const AppAreaContainerTitle = () => fabricate('Text')
  .setStyles(({ palette, fonts }) => ({
    color: 'white',
    fontSize: '0.9rem',
    fontFamily: fonts.body,
    fontWeight: 'bold',
    padding: '5px',
    margin: '0px',
    borderBottom: `solid 1px ${palette.grey6}`,
  }))
  .setText('Device Metrics');
