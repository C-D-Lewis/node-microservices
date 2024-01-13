import { Fabricate, FabricateComponent } from 'fabricate.js';
import { APP_CARD_WIDTH } from '../constants';
import Theme from '../theme';
import { AppState, RequestState } from '../types';
import AppControls from './AppControls';
import { appRequestStateKey } from '../utils';

declare const fabricate: Fabricate<AppState>;

/**
 * Get status color for a given app.
 *
 * @param {AppState} state - App state.
 * @param {string} app - App name.
 * @returns {string} Status color.
 */
const getAppStatusColor = (state: AppState, app: string): string => {
  const { selectedDevice, deviceApps } = state;
  if (selectedDevice === null) return 'pink';

  const { deviceName } = selectedDevice;
  const apps = deviceApps[deviceName];
  const { status } = apps.find((p) => p.app === app)!;
  return status?.includes('OK') ? Theme.palette.statusOk : Theme.palette.statusDown;
};

/**
 * Get color for request state.
 *
 * @param {RequestState} reqState - Request state.
 * @returns {string} Color
 */
const getReqStateColor = (reqState: RequestState) => {
  if (reqState === 'success') return Theme.palette.statusOk;
  if (reqState === 'pending') return Theme.palette.statusPending;
  if (reqState === 'error') return Theme.palette.statusDown;
  return 'pink';
};

/**
 * CardContainer component.
 *
 * @param {object} props - Component props.
 * @param {number} [props.size] - Grid size.
 * @returns {HTMLElement} Fabricate component.
 */
const CardContainer = ({ size = 1 }: { size: number }) => fabricate('Card')
  .asFlex('column')
  .setStyles(({ palette }) => ({
    width: `${APP_CARD_WIDTH * size}px`,
    margin: '10px 0px 10px 20px',
    opacity: '0',
    visibility: 'hidden',
    transition: '0.6s',
    backgroundColor: palette.grey5,
    boxShadow: '2px 2px 3px 1px #0004',
  }));

/**
 * AppName component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AppName = () => fabricate('Text')
  .setStyles(({ fonts }) => ({
    fontSize: '1.1rem',
    flex: '1',
    color: 'white',
    margin: '6px 5px 5px 5px',
    fontFamily: fonts.code,
    fontWeight: 'bold',
    cursor: 'default',
  }));

/**
 * StatusText component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const StatusText = () => fabricate('Text')
  .setStyles(({ palette }) => ({
    color: palette.lightGrey,
    fontSize: '0.9rem',
    paddingTop: '1',
    marginBottom: '2px',
    cursor: 'default',
  }));

/**
 * StatusLED component.
 *
 * @param {object} props - Component props.
 * @param {string} props.app - App.
 * @returns {HTMLElement} Fabricate component.
 */
const StatusLED = ({ app }: { app: string }) => {
  const reqStateKey = appRequestStateKey(app);

  /**
   * Update the LED color.
   *
   * @param {FabricateComponent<AppState>} el - This element.
   * @param {AppState} state - App state.
   */
  const updateColor = (el: FabricateComponent<AppState>, state: AppState) => {
    const { selectedDevice } = state;
    if (selectedDevice === null) return;

    const pending = state[reqStateKey] === 'pending';
    const reqStateColor = getReqStateColor(state[reqStateKey]);
    const statusColor = getAppStatusColor(state, app);
    el.setStyles({ backgroundColor: pending ? reqStateColor : statusColor });
  };

  return fabricate('div')
    .setStyles({
      width: '15px',
      height: '15px',
      borderRadius: '9px',
      marginRight: '5px',
    })
    .onCreate(updateColor)
    .onUpdate(updateColor, [reqStateKey]);
};

/**
 * CardStatus component.
 *
 * @param {object} props - Component props.
 * @param {string} props.app - App.
 * @returns {HTMLElement} Fabricate component.
 */
const CardStatus = ({ app }: { app: string }) => fabricate('Row')
  .setStyles({
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: '2',
  })
  .setChildren([
    StatusLED({ app }),
    StatusText()
      .onCreate((el, { selectedDevice, deviceApps }) => {
        if (selectedDevice === null) return;

        const apps = deviceApps[selectedDevice.deviceName];
        const { status, port } = apps.find((p) => p.app === app)!;
        el.setText(`${status} (${port})`);
      }),
  ]);

/**
 * CardTitleRow component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const CardTitleRow = () => fabricate('Row')
  .setStyles(({ palette }) => ({
    alignItems: 'center',
    backgroundColor: palette.grey5,
    padding: '5px 10px',
  }));

/**
 * AppCard component.
 *
 * @param {object} props - Component props.
 * @param {string} props.app - App name.
 * @returns {HTMLElement} Fabricate component.
 */
const AppCard = ({ app }: { app: string }) => {
  const size = app === 'monitor' ? 2 : 1;
  const container = CardContainer({ size });

  // Become visible shortly after creation
  setTimeout(() => container.setStyles({ opacity: '1', visibility: 'visible' }), 50);

  return container
    .setChildren([
      CardTitleRow()
        .setChildren([
          AppName().setText(app),
          CardStatus({ app }),
        ]),
      AppControls({ app }),
    ]);
};

export default AppCard;
