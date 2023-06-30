/**
 * ItemPill component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - Item icon.
 * @param {string} props.text - Item text.
 * @returns {HTMLElement} Fabricate component.
 */
fabricate.declare('ItemPill', ({ src, text }) => {
  const {
    AppCard: { titleBar },
  } = Theme.colors;

  return fabricate('Row')
    .setStyles({
      cursor: 'default',
      borderRadius: '15px',
      backgroundColor: titleBar,
      margin: '5px',
      alignItems: 'center',
      padding: '0px 5px',
      height: 'fit-content',
    })
    .setChildren([
      fabricate('Image', { src })
        .setStyles({ width: '18px', height: '18px' }),
      fabricate('Text')
        .setStyles({
          color: 'white',
          fontSize: '0.9rem',
          fontFamily: 'monospace',
        })
        .setText(text),
    ]);
});
