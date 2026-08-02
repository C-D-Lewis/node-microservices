/* eslint-disable no-param-reassign */
const { XMLParser } = require('fast-xml-parser');
const {
  fetch, log, ses, attic,
} = require('../node-common')(['fetch', 'log', 'ses', 'attic']);

/** attic key for already-seen guids */
const DB_KEY_SAVED_PUBDATE = 'feedLastPubDate';

const parser = new XMLParser();
let failed;

/**
 * Fetch a feed and send alert when a new item is published.
 *
 * @param {object} args - plugin ARGS object.
 * @param {string} args.FEED_URL - Feed URL, such as http://feeds.bbci.co.uk/news/technology/rss.xml
 */
module.exports = async (args = {}) => {
  const { FEED_URL } = args;
  if (!FEED_URL) {
    log.error('No feed URL provided');
    return;
  }

  try {
    const { body } = await fetch(FEED_URL);
    const xml = parser.parse(body);

    const {
      rss: {
        channel: { item: items },
      },
    } = xml;

    const mostRecentDateStr = items.reduce((acc, p) => {
      const d = new Date(p.pubDate);
      return d > new Date(acc) ? p.pubDate : acc;
    }, items[0].pubDate);
    const mostRecentDate = new Date(mostRecentDateStr);

    // Save now and skip
    if (!await attic.exists(DB_KEY_SAVED_PUBDATE)) {
      await attic.set(DB_KEY_SAVED_PUBDATE, mostRecentDate);
      log.info(`Saved initial pubDate: ${mostRecentDate}`);
      return;
    }

    // Find any newer than the last saved pubDate
    const savedPubDate = new Date(await attic.get(DB_KEY_SAVED_PUBDATE));
    const newItems = items.filter((p) => {
      const d = new Date(p.pubDate);
      return d > savedPubDate;
    });
    log.debug({ savedPubDate, items: items.length, newItems: newItems.length });

    // If any new ones, notify and update saved pubDate
    if (newItems.length) {
      await attic.set(DB_KEY_SAVED_PUBDATE, newItems[0].pubDate);

      const content = `New RSS feed items from ${FEED_URL}:
=================================

${newItems
    .map((p) => {
      const { title, description } = p;
      return `${title}\n${description}`;
    })
    .join('\n\n')}`;
      await ses.notify(content);
    }

    // This run succeeded
    failed = false;
  } catch (e) {
    log.error(e);
    if (failed) return;

    failed = true;
    await ses.notify(`Failed to fetch RSS feed content: ${FEED_URL}`);
  }
};
