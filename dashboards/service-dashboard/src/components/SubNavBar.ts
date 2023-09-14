import { Fabricate, FabricateComponent } from "../../node_modules/fabricate.js/types/fabricate";
import { sendConduitPacket } from "../services/conduitService";
import Theme from "../theme";
import { AppState } from "../types";
import { getReachableIp } from "../utils";
import IconButton from "./IconButton";

declare const fabricate: Fabricate<AppState>;

/**
 * AllDevicesBreadcrumb component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const AllDevicesBreadcrumb = () => fabricate('p')
  .setStyles({
    color: 'white',
    margin: '10px 15px',
    cursor: 'default',
  })
  .setText('All Devices');

/**
 * Send a device command by URL.
 *
 * @param {HTMLElement} el - This element.
 * @param {object} state - Current state.
 * @param {string} topic - Command topic, either 'reboot' or 'shutdown'.
 */
const commandDevice = async (
  el: FabricateComponent<AppState>,
  state: AppState,
  topic: string,
) => {
  const stateKey = fabricate.buildKey('command', topic);
  const pressed = !!state[stateKey];

  // Reset color regardless
  setTimeout(() => {
    el.setStyles({ backgroundColor: Theme.colors.IconButton.background });
    fabricate.update(stateKey, false);
  }, 3000);

  el.setStyles({ backgroundColor: !pressed ? 'red' : '#0003' });
  fabricate.update(stateKey, !pressed);
  if (!pressed) return;

  try {
    const { error } = await sendConduitPacket(state, { to: 'conduit', topic });
    if (error) throw new Error(error);

    console.log(`Device ${state.selectedDevice?.deviceName} sent ${topic} command`);
    el.setStyles({ backgroundColor: Theme.colors.status.ok });
  } catch (e) {
    alert(e);
    console.log(e);
  }
};

/**
 * ToolbarButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Image src.
 * @returns {HTMLElement} Fabricate component.
 */
const ToolbarButton = ({ src }: { src: string }) => IconButton({ src })
  .setStyles({
    width: '20px',
    height: '20px',
    marginRight: '10px',
    transition: '0.5s',
  });

/**
 * RebootButton component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const RebootButton = () => ToolbarButton({ src: 'assets/restart.png' })
  .onClick((el, state) => commandDevice(el, state, 'reboot'));

/**
 * ShutdownButton component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const ShutdownButton = () => ToolbarButton({ src: 'assets/shutdown.png' })
  .onClick((el, state) => commandDevice(el, state, 'shutdown'));

/**
 * BackBreadcrumb component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
const BackBreadcrumb = () => {
  const backButton = fabricate('p')
    .setStyles({
      color: 'white',
      margin: '10px 5px 10px 15px',
      cursor: 'pointer',
      textDecoration: 'underline',
    })
    .setText('All Devices')
    .onClick(() => fabricate.update({ page: 'FleetPage' }));

  const deviceSegment = fabricate('p')
    .setStyles({ color: 'white', margin: '10px 5px', cursor: 'default' });

  /**
   * Update the layout.
   *
   * @param {FabricateComponent} el - Page element.
   * @param {AppState} state - App state.
   */
  const updateLayout = (el: FabricateComponent<AppState>, state: AppState) => {
    const { fleet, selectedDevice } = state;
    if (selectedDevice === null) return;

    const found = fleet.find(({ deviceName }) => deviceName === selectedDevice.deviceName);
    if (found) deviceSegment.setText(`< ${found.deviceName} (${getReachableIp(state)})`);
  };

  return fabricate('Row')
    .setStyles({ alignItems: 'center' })
    .setChildren([
      backButton,
      deviceSegment,
      fabricate('Row')
        .setStyles({ position: 'absolute', right: '5px' })
        .setChildren([
          RebootButton(),
          ShutdownButton(),
        ]),
    ])
    .onCreate(updateLayout)
    .onUpdate(updateLayout, ['fleet', 'selectedDevice']);
};

/**
 * SubNavBar component.
 *
 * @returns {FabricateComponent} SubNavBar component.
 */
const SubNavBar = () => fabricate('Row')
  .setStyles({
    backgroundColor: Theme.colors.SubNavBar.background,
    paddingLeft: '8px',
    boxShadow: '2px 2px 3px 1px #0004',
  })
  .setChildren([
    fabricate.conditional(({ page }) => page === 'FleetPage', AllDevicesBreadcrumb),
    fabricate.conditional(({ page }) => page === 'AppsPage', BackBreadcrumb),
  ]);

export default SubNavBar;
