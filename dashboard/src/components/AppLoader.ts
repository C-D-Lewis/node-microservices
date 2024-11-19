import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * Customized Loader.
 *
 * @returns {FabricateComponent} Loader.
 */
const AppLoader = () => fabricate('Loader', {
  size: 48,
  color: 'white',
  backgroundColor: '#0000',
})
  .setStyles({ margin: '10px auto' });

export default AppLoader;
