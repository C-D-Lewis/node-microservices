import { Fabricate, FabricateComponent } from "../../node_modules/fabricate.js/types/fabricate";
import DeviceCard from "../components/DeviceCard";
import { AppState, Device } from "../types";
import { fetchApps } from "../utils";

declare const fabricate: Fabricate<AppState>;

/**
 * GroupLabel component.
 *
 * @param {object} props - Component props.
 * @param {string} props.publicIp - Public IP.
 * @returns {HTMLElement} GroupLabel component.
 */
const GroupLabel = ({ publicIp }: { publicIp: string }) => fabricate('Row')
  .setStyles({
    borderRadius: '10px 10px 0px 0px',
    marginBottom: '10px',
    backgroundColor: '#0004',
    padding: '10px',
    alignItems: 'center',
    justifyContent: 'center',
  })
  .setChildren([
    fabricate('Image', { src: 'assets/network.png' })
      .setStyles({
        width: '20px',
        height: '20px',
        marginRight: '5px',
      }),
    fabricate('div')
      .setStyles({
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        cursor: 'default',
      })
      .setText(publicIp),
  ]);

/**
 * FleetPage component, column of public IPs with devices inside them.
 */
const FleetPage = () => {
  /**
   * Update fleet cards.
   *
   * @param {FabricateComponent} el - Page element.
   * @param {AppState} state - App state.
   */
  const updateLayout = async (el: FabricateComponent<AppState>, state: AppState) => {
    const { fleet } = state;
    if (!fleet.length) return;

    // Sort fleet into publicIp buckets
    const buckets: Record<string, Device[]> = {};
    fleet.forEach((device) => {
      const { publicIp } = device;
      if (!buckets[publicIp]) {
        buckets[publicIp] = [];
      }

      buckets[publicIp].push(device);
    });

    // Group area for each bucket
    el.setChildren(Object.entries(buckets).map(([publicIp, devices]) => (
      fabricate('Column')
        .setStyles({
          backgroundColor: '#0004',
          borderRadius: '10px',
          margin: '15px',
          boxShadow: '2px 2px 3px 1px #0004',
          width: 'fit-content',
        })
        .setChildren([
          GroupLabel({ publicIp }),
          fabricate('Row')
            .setStyles({
              flexWrap: 'wrap',
              paddingBottom: '10px',
            })
            .setChildren(devices.map((device) => DeviceCard({ device }))),
        ])
    )));
  };
  
  return fabricate('Column')
    .onCreate(updateLayout)
    .onUpdate((el, state, keys) => {
      updateLayout(el, state);

      if (keys.includes('fleet')) {
        // Fetch apps for all devices at once
        fetchApps(state);
      }
    }, ['fleet']);
};

export default FleetPage;
