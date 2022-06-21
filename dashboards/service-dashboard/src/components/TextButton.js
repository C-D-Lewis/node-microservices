/**
 * TextButton component.
 *
 * @param {object} props - Component props.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const TextButton = () => fab.Button({
  color: 'white',
  backgroundColor: Colors.primary,
})
  .withStyle({
    height: '30px',
    fontSize: '1.1rem',
  });
