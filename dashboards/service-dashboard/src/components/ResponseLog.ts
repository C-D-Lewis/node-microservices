import { Fabricate, FabricateComponent } from 'fabricate.js';
import Theme from '../theme';
import { AppState } from '../types';

declare const fabricate: Fabricate<AppState>;

/**
 * LogEntry component.
 *
 * @param {object} props - Component props.
 * @param {string} props.text - Text to show, could be JSON.
 * @returns {HTMLElement} LogEntry component.
 */
const LogEntry = ({ text }: { text: string }) => {
  const wasError = text.includes('"error"');

  let finalText = text.slice(0, 1000);
  try {
    finalText = JSON.stringify(JSON.parse(text), null, 2);
  } catch (e) { /** Not JSON */ }

  return fabricate('pre')
    .setStyles({
      fontFamily: Theme.fonts.code,
      color: 'white',
      fontSize: '0.8rem',
      backgroundColor: wasError ? Theme.palette.statusDown : Theme.palette.grey3,
      margin: '0',
      padding: '5px 15px',
      borderTop: 'solid 2px #555',
      borderBottom: 'solid 2px #111',
      marginBottom: '3px',
    })
    .setText(finalText);
};

/**
 * ResponseLog component.
 *
 * @returns {FabricateComponent} ResponseLog component.
 */
const ResponseLog = () => {
  const maxWidth = fabricate.isNarrow() ? '300px' : '600px';

  return fabricate('Column')
    .setStyles({
      position: 'absolute',
      right: '0',
      top: '0',
      backgroundColor: Theme.palette.grey3,
      minWidth: '0px',
      maxWidth: '0px',
      height: '100vh',
      flex: '1',
      padding: '10px 0px',
      overflowY: 'scroll',
      transition: '0.3s',
    })
    .onUpdate(
      (el, { logEntries, logExpanded }, keys) => {
        if (keys.includes('logEntries')) {
          // TODO: Only add new items based on content or timestamp, not all
          const reversed = logEntries.slice().reverse();
          el.setChildren(reversed.map((text) => LogEntry({ text })));
          return;
        }

        if (keys.includes('logExpanded')) {
          const newWidth = logExpanded ? maxWidth : '0px';
          el.setStyles({
            minWidth: newWidth,
            maxWidth: newWidth,
          });
        }
      },
      ['logEntries', 'logExpanded'],
    );
};

export default ResponseLog;
