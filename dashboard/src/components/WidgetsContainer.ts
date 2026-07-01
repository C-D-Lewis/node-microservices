import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * DeviceWidgets item container.
 *
 * @returns {FabricateComponent} WidgetsContainer component.
 */
export const WidgetsContainer = () => fabricate('Column')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey2,
    border: `solid 2px ${palette.grey6}`,
    margin: '30px 30px 0px 30px',
    minWidth: '90%',
    minHeight: '64px',
  }))
  .setNarrowStyles({ margin: '15px' });

/**
 * WidgetsContainer title.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - Title text to display.
 * @returns {FabricateComponent} WidgetsContainerTitle component.
 */
export const WidgetsContainerTitle = ({ title }: { title: string }) => {
  const titleEl = fabricate('Text')
    .setStyles(({ fonts }) => ({
      color: 'white',
      fontSize: '1.1rem',
      fontFamily: fonts.body,
      fontWeight: 'bold',
      padding: '5px',
      margin: '0px',
      marginRight: '10px',
    }))
    .setText(title);

  return fabricate('Row')
    .setStyles(({ palette }) => ({
      borderBottom: `solid 1px ${palette.grey6}`,
      padding: '5px',
      alignItems: 'center',
    }))
    .setChildren([titleEl]);
};
