import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState, Device } from '../types.ts';
import { commandDevice, getTimeAgoStr } from '../util.ts';
import Theme from '../theme.ts';
import IconButton from './IconButton.ts';
import { sendConduitPacket } from '../services/conduitService.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * ToolbarButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Image src.
 * @returns {HTMLElement} Fabricate component.
 */
const ToolbarButton = ({ src }: { src: string }) => IconButton({ src })
  .setStyles({
    width: '24px',
    height: '24px',
    marginRight: '10px',
    transition: '0.5s',
  });

/**
 * Schedule an upgrade in progress check.
 *
 * @param {FabricateComponent} el - Element.
 * @param {AppState} state - App state.
 */
const scheduleUpgradeCheck = (el: FabricateComponent<AppState>, state: AppState) => {
  el.setStyles({ backgroundColor: 'darkorange' });
  setTimeout(async () => {
    // Get status
    const packet = { to: 'conduit', topic: 'getIsUpgrading' };
    const { upgrading } = await sendConduitPacket(state, packet);

    // If done, stop checking
    if (!upgrading) {
      el.setStyles({ backgroundColor: '#0003' });
      return;
    }

    // Else schedule another check
    scheduleUpgradeCheck(el, state);
  }, 5000);
};

/**
 * UpgradeButton component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const UpgradeButton = ({ device }: { device: Device }) => ToolbarButton({
  src: 'assets/images/upgrade.png',
})
  .onClick(async (el, state) => {
    const r = await commandDevice(el, state, device, 'upgrade', false);

    if (r) scheduleUpgradeCheck(el, state);
  });

/**
 * RebootButton component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const RebootButton = ({ device }: { device: Device }) => ToolbarButton({
  src: 'assets/images/restart.png',
})
  .onClick((el, state) => commandDevice(el, state, device, 'reboot'));

/**
 * ShutdownButton component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const ShutdownButton = ({ device }: { device: Device }) => ToolbarButton({
  src: 'assets/images/shutdown.png',
})
  .setStyles({ marginRight: '0px' })
  .onClick((el, state) => commandDevice(el, state, device, 'shutdown'));

/**
 * Toolbar component.
 *
 * @param {object} props - Component props.
 * @param {object} props.device - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const Toolbar = ({ device }: { device: Device }) => fabricate('Row')
  .setStyles({
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    padding: '8px',
  })
  .setChildren([
    UpgradeButton({ device }),
    RebootButton({ device }),
    ShutdownButton({ device }),
  ]);

/**
 * StatView component.
 *
 * @param {object} props - Component props.
 * @param {string} props.iconSrc - Icon src.
 * @param {string} props.text - Text to show.
 * @param {string} props.fontFamily - Text font.
 * @returns {HTMLElement} Fabricate component.
 */
const StatView = ({
  iconSrc,
  text,
  fontFamily,
}: {
  iconSrc: string,
  text: string,
  fontFamily: string,
}) => fabricate('Row')
  .setStyles(({ palette }) => ({
    alignItems: 'center',
    borderRight: `solid 2px ${palette.grey6}`,
    padding: '0px 20px 0px 8px',
    minWidth: '200px',
    minHeight: '40px',
  }))
  .setNarrowStyles({
    borderRight: 'none',
    width: '100vw',
  })
  .setChildren([
    fabricate('Image', { src: iconSrc })
      .setStyles({
        width: '24px',
        height: '24px',
        margin: '4px',
      }),
    fabricate('Text')
      .setStyles({
        color: 'white',
        fontSize: '1rem',
        margin: '5px 0px',
        cursor: 'default',
        fontFamily,
      })
      .setText(text),
  ]);

/**
 * StatRow component.
 *
 * @param {object} props - Component props.
 * @param {Device} props.device - Current device.
 * @returns {HTMLElement} Fabricate component.
 */
const StatRow = ({ device }: { device: Device }) => {
  const {
    commit, commitDate, lastCheckIn, diskSize, diskUsage, uptimeDays,
  } = device;

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      backgroundColor: palette.grey4,
      minHeight: '50px',
    }))
    .setNarrowStyles({ flexWrap: 'wrap' })
    .setChildren([
      StatView({
        iconSrc: 'assets/images/commit.png',
        text: commit ? `${commit} (${getTimeAgoStr(new Date(commitDate).getTime())})` : 'Unknown',
        fontFamily: Theme.fonts.code,
      }),
      StatView({
        iconSrc: 'assets/images/eye.png',
        text: `${getTimeAgoStr(lastCheckIn)} ago`,
        fontFamily: Theme.fonts.body,
      }),
      StatView({
        iconSrc: 'assets/images/disk.png',
        text: `${diskUsage}% of ${diskSize} used`,
        fontFamily: Theme.fonts.body,
      }),
      StatView({
        iconSrc: 'assets/images/uptime.png',
        text: `${typeof uptimeDays === 'undefined' ? '-' : uptimeDays} days`,
        fontFamily: Theme.fonts.body,
      }),
      Toolbar({ device }),
    ]);
};

export default StatRow;
