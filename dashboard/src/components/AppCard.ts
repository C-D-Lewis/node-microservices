import { Fabricate } from 'fabricate.js';
import { AppState, DeviceApp } from '../types.ts';
import MonitorControls from './controls/MonitorControls.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * AppControls component.
 *
 * @param {object} props - Component props.
 * @param {object} props.app - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const AppControls = ({ app }: { app: DeviceApp }) => fabricate('Column')
  .setChildren([
    fabricate.conditional(() => app.app === 'monitor', MonitorControls),
  ]);

/**
 * StatusText component.
 *
 * @param {object} props - Component props.
 * @param {DeviceApp} props.app - App name.
 * @returns {HTMLElement} Fabricate component.
 */
const StatusText = ({ app }: { app: DeviceApp }) => {
  const { status, port } = app;

  return fabricate('Text')
    .setStyles(({ palette }) => ({
      color: palette.greyC,
      fontSize: '0.9rem',
      cursor: 'default',
      textAlign: 'end',
      width: '100%',
    }))
    .setText(`${status} (${port})`);
};

/**
 * AppStatusRow component.
 *
 * @param {object} props - Component props.
 * @param {object} props.app - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const AppStatusRow = ({ app }: { app: DeviceApp }) => fabricate('Row')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey4,
    padding: '5px',
    alignItems: 'center',
  }))
  .setChildren([
    fabricate('Image', { src: 'assets/images/app.png' })
      .setStyles({
        width: '24px',
        height: '24px',
        margin: '0px 5px',
      }),
    fabricate('Text')
      .setStyles(({ fonts }) => ({
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        fontFamily: fonts.code,
        cursor: 'default',
      }))
      .setText(app.app!),
    StatusText({ app }),
    // Port
  ]);

/**
 * AppCard component.
 *
 * @param {object} props - Component props.
 * @param {object} props.app - Device.
 * @returns {HTMLElement} Fabricate component.
 */
const AppCard = ({ app }: { app: DeviceApp }) => {
  const hasControls = ['monitor'].includes(app.app!);

  return fabricate('Column')
    .setStyles(({ palette }) => ({
      margin: '5px',
      backgroundColor: palette.grey3,
      width: '300px',
      border: `solid 2px ${palette.grey6}`,
      height: '100%',
    }))
    .setNarrowStyles({ width: '100%' })
    .setChildren([
      AppStatusRow({ app }),

      // TODO More elegant way of doing this
      fabricate.conditional(() => hasControls, () => AppControls({ app })),
    ]);
};

export default AppCard;
