
/**
 * TextButton component.
 *
 * @param {object} props - Component props.
 * @param {string} props.label - Button text label.
 * @param {string} props.color - Button text and border color.
 * @param {string} props.backgroundColor - Button background color.
 * @returns {HTMLElement}
 */
const TextButton = ({
  label,
  color,
  backgroundColor,
} = {}) => fabricate.Button({
  text: label,
  color,
  backgroundColor,
  highlight: false,
})
  .withStyles({
    minWidth: '10px',
    height: '30px',
    padding: '5px',
    margin: '5px',
    borderRadius: '5px',
    textAlign: 'center',
    justifyContent: 'center',
  });
