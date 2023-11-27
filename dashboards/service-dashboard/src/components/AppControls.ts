import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types';
import MonitorControls from './controls/MonitorControls';
import ClacksControls from './controls/ClacksControls';
import GuestlistControls from './controls/GuestlistControls';
import VisualsControls from './controls/VisualsControls';
import ConduitControls from './controls/ConduitControls';
import AtticControls from './controls/AtticControls';

declare const fabricate: Fabricate<AppState>;

/**
 * ControlRow component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
export const ControlRow = () => fabricate('Row')
  .setStyles({
    padding: '0px 10px',
    alignItems: 'center',
  });

/**
 * Control container component.
 *
 * @returns {HTMLElement} Fabricate component.
 */
export const ControlContainer = () => fabricate('Column')
  .setStyles(({ palette }) => ({ backgroundColor: palette.grey4 }));

const controlsMap: Record<string, () => FabricateComponent<AppState>> = {
  attic: AtticControls,
  conduit: ConduitControls,
  visuals: VisualsControls,
  clacks: ClacksControls,
  guestlist: GuestlistControls,
  monitor: MonitorControls,
  // concierge: list hooks?
  // polaris: show current record IP? Needs conduit API
};

/**
 * AppControls component.
 *
 * @param {object} props - Component props.
 * @param {string} props.app - App name
 * @returns {HTMLElement} Fabricate component.
 */
const AppControls = ({ app }: { app: string }) => {
  const Controls = controlsMap[app] || (() => fabricate('div'));
  return Controls();
};

export default AppControls;
