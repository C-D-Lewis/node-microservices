import { Fabricate, FabricateComponent } from 'fabricate.js';
import DeviceCard from '../components/DeviceCard';
import { AppState, Device } from '../types';
import { fetchApps } from '../utils';

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
 * Device group container.
 *
 * @returns {FabricateComponent} Device group container.
 */
const GroupContainer = () => fabricate('Column')
  .setStyles(({ palette, styles }) => ({
    backgroundColor: palette.translucentGrey,
    borderRadius: '10px',
    margin: '15px',
    boxShadow: styles.boxShadow,
    width: 'fit-content',
  }));

/**
 * FleetPage component, column of public IPs with devices inside them.
 *
 * @returns {FabricateComponent} FleetPage component.
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
    el.setChildren(
      Object
        .entries(buckets)
        .map(([publicIp, devices]) => (
          GroupContainer()
            .setChildren([
              GroupLabel({ publicIp }),
              fabricate('Row')
                .setStyles({
                  flexWrap: 'wrap',
                  paddingBottom: '10px',
                })
                .setChildren(devices.map((device) => DeviceCard({ device }))),
            ]))),
    );
  };

  return fabricate('Column')
    .onUpdate((el, state) => {
      updateLayout(el, state);

      // Fetch apps for all devices at once
      if (!Object.keys(state.deviceApps).length) fetchApps(state);
    }, ['fabricate:created', 'fleet']);
};

export default FleetPage;
