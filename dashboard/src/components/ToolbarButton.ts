import IconButton from './IconButton.ts';

/**
 * ToolbarButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Image src.
 * @returns {HTMLElement} Fabricate component.
 */
const ToolbarButton = ({ src }: { src: string }) => IconButton({ src })
  .setStyles({
    width: '24px',
    height: '24px',
    marginRight: '10px',
    transition: '0.5s',
  });

export default ToolbarButton;
