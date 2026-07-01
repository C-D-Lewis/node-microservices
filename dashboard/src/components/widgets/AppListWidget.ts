import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../../types.ts';
import AppCard from '../AppCard.ts';
import { WidgetsContainer, WidgetsContainerTitle } from '../WidgetsContainer.ts';

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
 * @returns {FabricateComponent} AppListWidget component.
 */
const AppListWidget = () => WidgetsContainer()
  .setChildren([
    WidgetsContainerTitle({ title: 'Device Apps' }),
    CardList(),
  ]);

export default AppListWidget;
