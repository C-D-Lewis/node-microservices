/**
 * LogEntry component.
 *
 * @param {object} props - Component props.
 * @param {string} props.text - Text to show, could be JSON.
 * @returns {HTMLElement}
 */
const LogEntry = ({ text }) => {
  const wasError = text.includes('"error"');

  let finalText = text;
  try {
    finalText = JSON.stringify(JSON.parse(text), null, 2);
  } catch (e) { /** Not JSON */ }

  return fabricate('pre')
    .setStyles({
      fontFamily: Theme.fonts.code,
      color: 'white',
      fontSize: '0.8rem',
      backgroundColor: wasError ? Theme.colors.status.down : Theme.colors.consoleGrey,
      margin: 0,
      padding: '5px 15px',
      borderTop: 'solid 2px #555',
      borderBottom: 'solid 2px #111',
      marginBottom: '3px',
    })
    .setText(finalText);
};

/**
 * ResponseBar component.
 *
 * @returns {HTMLElement}
 */
fabricate.declare('ResponseLog', () => fabricate('Column')
  .setStyles({
    backgroundColor: Theme.colors.consoleGrey,
    minWidth: '600px',
    height: '100%',
    flex: 1,
    padding: '10px 0px',
    overflowY: 'scroll',
  })
  .onUpdate(
    (el, { logEntries }) => {
      // TODO: Only add new items based on content or timestamp, not all
      const reversed = logEntries.slice().reverse();
      el.setChildren(reversed.map((text) => LogEntry({ text })));
    },
    ['logEntries'],
  )
  .onCreate((el, { logEntries }) => {
    // Show what's already there
    const reversed = logEntries.slice().reverse();
    el.setChildren(reversed.map((text) => LogEntry({ text })));
  }));
