import { Fabricate, FabricateComponent } from 'fabricate.js';
import { WidgetsContainer, WidgetsContainerTitle } from '../WidgetsContainer.ts';
import { AppState } from '../../types.ts';
import { NoThingsLabel } from '../NoThingsLabel.ts';
import { fetchRunningContainers } from '../../services/conduitService.ts';

declare const fabricate: Fabricate<AppState>;

const ContainerView = ({ name, status }) => fabricate('Row')
  .setStyles({
    backgroundColor: '#1D63ED',
    padding: '6px',
    borderRadius: '4px',
  })
  .setChildren([
    fabricate('Image', { src: 'assets/images/docker.png' })
      .setStyles({ width: '24px', height: '24px' }),
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
    WidgetsContainerTitle({ title: 'Docker Containers' }),
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
