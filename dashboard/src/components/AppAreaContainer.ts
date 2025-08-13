import { Fabricate, FabricateComponent } from 'fabricate.js';
import { AppState } from '../types.ts';

declare const fabricate: Fabricate<AppState>;

/**
 * AppArea item container.
 *
 * @returns {FabricateComponent} AppAreaContainer component.
 */
export const AppAreaContainer = () => fabricate('Column')
  .setStyles(({ palette }) => ({
    backgroundColor: palette.grey2,
    border: `solid 2px ${palette.grey6}`,
    margin: '30px 30px 0px 30px',
    width: 'fit-content',
    minWidth: '250px',
    minHeight: '64px',
  }))
  .setNarrowStyles({ margin: '15px' });

/**
 * AppAreaContainer title.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - Title text to display.
 * @returns {FabricateComponent} AppAreaContainerTitle component.
 */
export const AppAreaContainerTitle = ({ title }: { title: string }) => {
  const titleEl = fabricate('Text')
    .setStyles(({ fonts }) => ({
      color: 'white',
      fontSize: '0.9rem',
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
