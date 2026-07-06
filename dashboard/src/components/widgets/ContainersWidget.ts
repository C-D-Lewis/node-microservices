import { Fabricate, FabricateComponent } from 'fabricate.js';
import { WidgetsContainer, WidgetsContainerTitle } from '../WidgetsContainer.ts';
import { AppState } from '../../types.ts';
import { NoThingsLabel } from '../NoThingsLabel.ts';
import { fetchRunningContainers } from '../../services/conduitService.ts';
import IconButton from '../IconButton.ts';
import { commandDevice } from '../../util.ts';
import ToolbarButton from '../ToolbarButton.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * ContainersList component.
 *
 * @param {object} props - Component props.
 * @param {string} props.name - Container name.
 * @param {string} props.status - Container status string.
 * @returns {FabricateComponent} Fabricate component.
 */
const ContainerView = ({ name, status }: { name: string, status: string }) => fabricate('Row')
  .setStyles({
    backgroundColor: '#1D63ED',
    padding: '6px',
    borderRadius: '4px',
    margin: '4px',
    alignItems: 'center',
  })
  .setChildren([
    fabricate('Image', { src: 'assets/images/container.png' })
      .setStyles({
        width: '24px',
        height: '24px',
        margin: '0px 3px',
      }),
    fabricate('Text')
      .setStyles(({ palette, fonts }) => ({
        fontSize: '0.9rem',
        color: palette.text,
        fontFamily: fonts.code,
      }))
      .setText(`${name} (${status})`),
  ]);

/**
 * ContainersList component.
 *
 * @returns {FabricateComponent} Fabricate component.
 */
const ContainersList = () => fabricate('Row')
  .setStyles({
    flexWrap: 'wrap',
    padding: '8px',
  })
  .onUpdate((el, { runningContainers }) => {
    el.setChildren(runningContainers.map(ContainerView));
  }, [fabricate.StateKeys.Created, 'runningContainers']);

/**
 * ContainersWidget component.
 *
 * @returns {FabricateComponent} Fabricate component.
 */
const ContainersWidget = () => WidgetsContainer()
  .setChildren([
    WidgetsContainerTitle({ title: 'Docker Containers' })
      .addChildren([
        ToolbarButton({ src: 'assets/images/shutdown.png' })
          .onClick(async (el, state) => {
            const r = await commandDevice(el, state, state.selectedDevice!, 'stopAllContainers');
            if (r) fabricate.update({ runningContainers: [] });
          }),
      ]),
    fabricate.conditional((state) => !!state.runningContainers.length, ContainersList),
    fabricate.conditional(
      (state) => !state.runningContainers.length,
      () => NoThingsLabel().setText('No containers'),
    ),
  ])
  .onCreate((el, state) => {
    fetchRunningContainers(state);
  });

export default ContainersWidget;
