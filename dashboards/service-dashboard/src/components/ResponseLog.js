/* global Fonts */

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

  return fab('pre')
    .withStyles({
      fontFamily: Fonts.code,
      color: 'white',
      fontSize: '0.8rem',
      backgroundColor: wasError ? Colors.status.down : Colors.consoleGrey,
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
// eslint-disable-next-line no-unused-vars
const ResponseLog = () => fab.Column()
  .withStyles({
    backgroundColor: Colors.consoleGrey,
    minWidth: '600px',
    height: '100%',
    flex: 1,
    padding: '10px 0px',
    overflowY: 'scroll',
  })
  .watchState(
    (el, { logEntries }) => {
      // TODO: Only add new items based on content or timestamp, not all
      el.clear();

      const reversed = logEntries.slice().reverse();
      el.addChildren(reversed.map((text) => LogEntry({ text })));
    },
    ['logEntries'],
  )
  .then((el) => {
    const logEntries = fab.getState('logEntries');
    const reversed = logEntries.slice().reverse();
    el.addChildren(reversed.map((text) => LogEntry({ text })));
  });
