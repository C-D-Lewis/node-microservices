import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppAreaContainer, AppAreaContainerTitle } from './AppAreaContainer.ts';
import ToolbarButton from './ToolbarButton.ts';
import { sendConduitPacket } from '../services/conduitService.ts';
import { AppState, RealtimeMetricData } from '../types.ts';

declare const fabricate: Fabricate<AppState>;
declare const fab: Fabricate<AppState>;

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

/**
 * TemperatureRow component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const TemperatureRow = () => fabricate('Row')
  .setChildren([
    fabricate('Image', { src: 'assets/images/thermometer.png' })
      .setStyles({ width: '26px', height: '26px' }),
    fabricate('Text')
      .setStyles(({ palette }) => ({
        color: palette.text,
        margin: '2px',
        cursor: 'default',
      }))
      .onUpdate((el, state) => {
        el.setText(`${state.realtimeMetrics?.temperature}°C`);
      }, [fabricate.StateKeys.Created, 'realtimeMetrics']),
  ]);

/**
 * ProcRow component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ProcRow = () => fabricate('Row')
  .setChildren([
    fabricate('Image', { src: 'assets/images/code.png' })
      .setStyles({ width: '26px', height: '26px' }),
    fabricate('Text')
      .setStyles(({ palette }) => ({
        color: palette.text,
        margin: '2px',
        cursor: 'default',
      }))
      .onUpdate((el, state) => {
        const { realtimeMetrics } = state;
        if (!realtimeMetrics) return;

        el.setChildren([
          ...realtimeMetrics.procs.map((p) => fabricate('Text')
            .setStyles(({ fonts }) => ({
              fontFamily: fonts.code,
              margin: '0px',
            }))
            .setText(`${p.cpu} ${p.mem} ${p.pid} ${p.cmd}`)),
        ]);
      }, [fabricate.StateKeys.Created, 'realtimeMetrics']),
  ]);

/**
 * RealtimeData component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const RealtimeData = () => fab('Column', { padding: '2px' })
  .setChildren([
    TemperatureRow(),
    ProcRow(),
  ]);

/**
 * DeviceMetrics component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const DeviceMetrics = () => AppAreaContainer()
  .setChildren([
    AppAreaContainerTitle({ title: 'Realtime Metrics' })
      .addChildren([EnableButton()]),
    fabricate.conditional((state) => !!state.realtimeMetrics, RealtimeData),
  ]);

export default DeviceMetrics;
