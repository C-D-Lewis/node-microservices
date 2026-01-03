import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppAreaContainer, AppAreaContainerTitle } from './AppAreaContainer.ts';
import ToolbarButton from './ToolbarButton.ts';
import { sendConduitPacket } from '../services/conduitService.ts';
import { AppState, RealtimeMetricData } from '../types.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * Schedule an update in realtime metrics.
 *
 * @param {FabricateComponent} el - Element.
 * @param {AppState} state - App state.
 * @param {boolean} [now] - Do update now.
 */
const scheduleUpdate = (el: FabricateComponent<AppState>, state: AppState, now?: boolean) => {
  setTimeout(async () => {
    // Get data
    const res = await sendConduitPacket(state, { to: 'monitor', topic: 'getRealtime' });
    const realtimeMetrics = res.message as RealtimeMetricData;

    fabricate.update({ realtimeMetrics });
    scheduleUpdate(el, state);
  }, now ? 110 : 5000);
};

/**
 * EnableButton component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const EnableButton = () => ToolbarButton({
  src: 'assets/images/shutdown.png',
})
  .onClick(async (el, state) => {
    el.setStyles({ visibility: 'hidden' });
    scheduleUpdate(el, state, true);
  });

const RealtimeData = () => fab('Column', {

})
  .setChildren([
    // Temp row
    fabricate('Text')
      .setStyles(({ palette }) => ({
        color: palette.text,
        margin: 'auto',
        cursor: 'default',
      }))
      .onUpdate((el, state) => {
        el.setText(`Temperature: ${state.realtimeMetrics?.temperature}`);
      }, ['realtimeMetrics']),

    // Procs rows
  ]);

/**
 * DeviceMetrics component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceMetrics = () => AppAreaContainer()
  .setChildren([
    AppAreaContainerTitle({ title: 'Realtime Metrics' })
      .addChildren([
        EnableButton(),
      ]),
    RealtimeData(),
  ]);

export default DeviceMetrics;
