import { Fabricate } from 'fabricate.js';
import { AppState, Device } from '../types';
import { commandDevice, getTimeAgoStr } from '../util';
import Theme from '../theme';
import IconButton from './IconButton';

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
    paddingRight: '8px',
  })
  .setChildren([
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
    borderRight: `solid 2px ${palette.greyA}`,
    padding: '0px 28px 0px 10px',
    minWidth: '210px',
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
        margin: '8px',
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
 * InfoRow component.
 *
 * @param {object} props - Component props.
 * @param {Device} props.device - Current device.
 * @returns {HTMLElement} Fabricate component.
 */
const InfoRow = ({ device }: { device: Device }) => {
  const {
    commit, commitDate, lastCheckIn, diskSize, diskUsage,
  } = device;

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      backgroundColor: palette.grey2,
      minHeight: '50px',
    }))
    .setNarrowStyles({
      flexWrap: 'wrap',
    })
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
      Toolbar({ device }),
    ]);
};

export default InfoRow;
