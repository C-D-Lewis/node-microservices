import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * NoThingsLabel component.
 *
 * @returns {FabricateComponent} Fabricate component.
 */
// eslint-disable-next-line import/prefer-default-export
export const NoThingsLabel = () => fabricate('Text')
  .setStyles(({ palette }) => ({
    color: palette.grey5,
    margin: 'auto',
    cursor: 'default',
    padding: '10px',
  }));
