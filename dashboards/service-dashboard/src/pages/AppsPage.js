/* global AppCard Fonts */

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
      backgroundColor: wasError ? Colors.statusDown : Colors.consoleGrey,
      margin: 0,
    })
    .setText(finalText);
};

/**
 * ResponseBar component.
 *
 * @returns {HTMLElement}
 */
const ResponseLog = () => fab.Column()
  .withStyles({
    backgroundColor: Colors.consoleGrey,
    width: '800px',
    height: '100%',
    flex: '0 0 auto',
    padding: '10px',
    overflowY: 'scroll',
  })
  .watchState(
    (el, { logEntries }) => {
      // TODO: Only add new items based on content or timestamp, not all
      el.clear();

      el.addChildren(logEntries.reverse().map((text) => LogEntry({ text })));
    },
    ['logEntries'],
  )
  .then((el) => {
    const logEntries = fab.getState('logEntries');
    el.addChildren(logEntries.reverse().map((text) => LogEntry({ text })));
  });

/**
 * AppsPage component.
 *
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
const AppsPage = () => fab.Row()
  .withStyles({ height: '100vh', alignItems: 'flex-start' })
  .withChildren([
    fab.Row()
      .withStyles({ flexWrap: 'wrap', paddingTop: '15px' })
      .watchState((el, { apps }) => {
        el.clear();
        el.addChildren([...apps.map(({ app }) => AppCard({ app }))]);
      }, ['apps']),
    ResponseLog(),
  ]);
