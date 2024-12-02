import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState, MonitorPlugin } from '../../types.ts';
import { sendConduitPacket } from '../../services/conduitService.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * Get schedule string for plugin.
 *
 * @param {MonitorPlugin} plugin - Plugin.
 * @returns {string} Schedule string.
 */
const getSchedule = (plugin: MonitorPlugin) => {
  const { EVERY, AT } = plugin;

  if (EVERY) return ` (every ${EVERY}m)`;
  if (AT) return ` (at ${AT})`;
  return ' (once)';
};

/**
 * PluginView component.
 *
 * @param {object} props - Component props.
 * @param {MonitorPlugin} props.plugin - Plugin data.
 * @returns {FabricateComponent} PluginView component.
 */
const PluginView = ({ plugin }: { plugin: MonitorPlugin }) => {
  const { FILE_NAME, ENABLED } = plugin;
  const disabled = ENABLED === false;

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      cursor: 'default',
      backgroundColor: disabled ? palette.grey3 : palette.grey4,
      margin: '3px',
      alignItems: 'center',
      padding: '2px 6px',
      height: 'fit-content',
    }))
    .setChildren([
      fabricate('Image', { src: 'assets/images/plugin.png' })
        .setStyles({
          width: '24px',
          height: '24px',
          filter: `brightness(${disabled ? '0.4' : '1'})`,
        }),
      fabricate('Text')
        .setStyles(({ palette, fonts }) => ({
          fontSize: '0.9rem',
          fontFamily: fonts.code,
          color: disabled ? palette.grey5 : 'white',
        }))
        .setText(`${FILE_NAME.replace('.js', '')}${getSchedule(plugin)}`),
    ]);
};

/**
 * MonitorControls component.
 *
 * @returns {FabricateComponent} Fabricate component.
 */
const MonitorControls = () => fabricate('Column')
  .setStyles({ padding: '5px' })
  .onCreate(async (el, state) => {
    const res = await sendConduitPacket(state, { to: 'monitor', topic: 'getPlugins' });
    fabricate.update('monitorPlugins', res.message);
  })
  .onUpdate((el, state) => {
    el.setChildren(state.monitorPlugins.map((plugin) => PluginView({ plugin })));
  }, ['monitorPlugins']);

export default MonitorControls;
