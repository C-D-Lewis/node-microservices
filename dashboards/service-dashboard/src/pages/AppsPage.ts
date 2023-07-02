import { Fabricate } from "../../node_modules/fabricate.js/types/fabricate";
import AppCard from "../components/AppCard";
import { AppState } from "../types";

declare const fabricate: Fabricate<AppState>;

/**
 * AppsPage component.
 */
const AppsPage = () => fabricate('Row')
  .setStyles({
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    paddingTop: '15px',
  })
  .onUpdate((el, { selectedDevice, deviceApps }) => {
    if (!selectedDevice) return;

    const apps = deviceApps[selectedDevice.deviceName];
    el.setChildren(apps.map((app) => AppCard({ app: app.app! })));
  }, ['selectedDevice', 'deviceApps']);

export default AppsPage;
