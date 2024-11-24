import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types.ts';
import AppCard from './AppCard.ts';
import { AppAreaContainer, AppAreaContainerTitle } from './AppAreaContainer.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * Card list component for apps running on device.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const CardList = () => fabricate('Row')
  .setStyles({ flexWrap: 'wrap' })
  .setNarrowStyles({ padding: '5px' })
  .onUpdate((el, state) => {
    el.setChildren(state.selectedDeviceApps.map((p) => AppCard({ app: p })));
  }, [fabricate.StateKeys.Created, 'selectedDeviceApps']);

/**
 * App card list in container.
 *
 * @returns {FabricateComponent} AppCardList component.
 */
const AppCardList = () => AppAreaContainer()
  .setChildren([
    AppAreaContainerTitle()
      .setText('Device Apps'),
    CardList(),
  ]);

export default AppCardList;
