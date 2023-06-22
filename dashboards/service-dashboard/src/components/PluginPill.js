/**
 * PluginPill component.
 *
 * @param {object} props - Component props.
 * @param {object} props.plugin - Plugin object.
 * @returns {HTMLElement} Fabricate component.
 */
fabricate.declare('PluginPill', ({ plugin }) => {
  const {
    FILE_NAME, EVERY, AT, ENABLED,
  } = plugin;
  const {
    AppCard: { titleBar },
    PluginPill: { disabled },
  } = Theme.colors;

  return fabricate('Row')
    .setStyles({
      cursor: 'default',
      borderRadius: '15px',
      backgroundColor: ENABLED !== false ? titleBar : disabled,
      margin: '5px',
      flexWrap: 'wrap',
      alignItems: 'center',
      padding: '0px 5px',
    })
    .setChildren([
      fabricate('Image', { src: 'assets/plugin.png' })
        .setStyles({ width: '18px', height: '18px' }),
      fabricate('Text')
        .setStyles({
          color: 'white',
          fontSize: '0.9rem',
          fontFamily: 'monospace',
        })
        .setText(`${FILE_NAME.replace('.js', '')}${EVERY ? ` (~${EVERY})` : ` (at ${AT})`}`),
    ]);
});
