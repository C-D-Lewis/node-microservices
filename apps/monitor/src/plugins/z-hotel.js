const fetch = require('node-fetch');
const { updateMetrics } = require('../modules/metrics');
const {
  log, ses, s3, csv, wait,
} = require('../node-common')(['log', 'ses', 's3', 'csv', 'wait']);

/** Available hotel codes */
const HOTEL_CODES = {
  City: 105003,
  CoventGarden: 105004,
  GloucesterPlace: 105006,
  Shoreditch: 105014,
  Soho: 105001,
  Holborn: 105007,
  Picadilly: 105009,
  Strand: 105010,
  TottenhamCourtRoad: 105011,
  Trafalgar: 105012,
  Victoria: 105013,
};
/** Output file for CSV */
const OUTPUT_FILE = `${__dirname}/../../z-hotel.csv`;
/** CSV headings */
const CSV_HEADINGS = ['timestamp', ...Object.keys(HOTEL_CODES)];
/** Wait range in milliseconds */
const WAIT_RANGE_MS = 1.5 * 60 * 1000; // assumes EVERY: 2

let notified = false;

/**
 * Get data for this hotel's rooms.
 *
 * @param {string} text - Search result HTML text.
 * @returns {Array<object>} - Array of room data objects.
 */
const getRooms = (text) => {
  const options = [];

  let spool = text;
  while (spool.includes('<section')) {
    const sectionStart = spool.indexOf('<section class="card-style room-with-rates-wrapper');
    const sectionEnd = spool.indexOf('</section>', sectionStart) + '</section>'.length;
    if (sectionStart === -1 || sectionEnd === -1) break;
    const section = spool.substring(sectionStart, sectionEnd);
    const lines = section.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

    // Get rooms left
    let remaining = -1;
    if (section.includes('<span>Only')) {
      const leftLine = lines.find((line) => line.includes('<span>Only'));
      const leftText = leftLine.split('<span>Only')[1].split(' left!</span>')[0].trim();
      remaining = parseInt(leftText, 10);
    }

    // Get room type name
    const nameLine = lines.find((line) => line.includes('<h3 class="initSlick"'));
    const nameStart = nameLine.indexOf('">') + 2;
    const nameEnd = nameLine.indexOf('<', nameStart);
    const name = nameLine.substring(nameStart, nameEnd).trim();

    // Get member price (without breakfast is first)
    const priceLineStart = section.indexOf('class="btn btn-default rate-code-10MEM');
    const priceLineEnd = section.indexOf('</a>', priceLineStart);
    const priceLine = section.substring(priceLineStart, priceLineEnd);
    const priceStart = priceLine.indexOf('&pound;') + '&pound;'.length;
    const priceEnd = section.indexOf('</a>', priceStart);
    const price = priceLine.substring(priceStart, priceEnd).trim();

    options.push({ name, remaining, price });
    spool = spool.substring(sectionEnd);
  }

  return options;
};

/**
 * Get search results HTML text for a hotel.
 *
 * @param {string} hotelCode - Hotel's code.
 * @returns {Promise<string>} - HTML text of the search result page.
 */
const getPageText = async (hotelCode) => {
  const date = new Date().toISOString().split('T')[0];
  const url = `https://bookings.thezhotels.com/rates-room1?hotel=${hotelCode}&arrival=${date}&nights=1&adults[1]=2&children[1]=0&rooms=1&code=`;
  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });
  return r.text();
};

/**
 * Get name and rooms for a hotel.
 *
 * @param {string} name - Hotel's name.
 * @param {number} hotelCode - Hotel's code.
 * @returns {Promise<{name: string, rooms: Array<object>}>} - Hotel name and rooms.
 */
const getHotelRooms = async (name, hotelCode) => {
  const text = await getPageText(hotelCode);
  return { name, rooms: getRooms(text) };
};

/**
 * Test if a room is under the price threshold.
 *
 * @param {number} threshold - Price threshold.
 * @returns {function(object): boolean} - Function to test if a room's price is under the threshold.
 */
const isUnderThreshold = (threshold) => (r) => parseFloat(r.price) < threshold;

/**
 * Get the cheapest room price for a hotel.
 *
 * @param {object} hotel - Hotel object.
 * @returns {number} - Cheapest room price or Infinity if no rooms available.
 */
const getHotelCheapestPrice = (hotel) => hotel
  .rooms
  .reduce((acc, room) => {
    const price = parseFloat(room.price);
    return price < acc ? price : acc;
  }, Infinity);

/**
 * Log metrics for lowest hotel price.
 *
 * @param {object} args - Arguments for the hotel plugin.
 * @param {number} args.START_H - Hour to start notifying from.
 * @param {Array<number>} args.DAYS - Days of the week to notify.
 * @param {number} args.PRICE_THRESHOLD - Price threshold for notifying.
 */
module.exports = async (args = {}) => {
  const {
    START_H = 12,
    DAYS = [3, 4],
    PRICE_THRESHOLD = 100,
  } = args;

  const d = new Date();
  const hours = d.getHours();
  const day = d.getDay();

  // Reset at 6am in any case
  log.debug(`notified: ${notified}`);
  if (hours === 6 && notified) {
    log.debug('z-hotel.js: Resetting notified status at 6am');
    notified = false;
  }

  // Don't spam site always
  if (hours < START_H || !DAYS.includes(day)) {
    log.debug(`z-hotel.js: Skipping ${hours}h on day ${day}`);
    updateMetrics({ lowestPrice: 0 });
    return;
  }

  // Wait a random amount
  const waitMs = Math.floor(Math.random() * WAIT_RANGE_MS);
  log.debug(`z-hotel.js: Waiting ${waitMs}ms`);
  await wait(waitMs);

  try {
    // Get all the data
    const hotels = await Promise.all(
      Object.entries(HOTEL_CODES).map(([k, v]) => getHotelRooms(k, v)),
    );
    log.debug(JSON.stringify(hotels, null, 2));

    // Notify if rooms available at acceptable price
    const candidates = hotels.filter((h) => h.rooms.some(isUnderThreshold(PRICE_THRESHOLD)));
    if (!notified && candidates.length > 0) {
      let msg = `Rooms available at less than £${PRICE_THRESHOLD}:`;
      candidates.forEach((h) => {
        msg += `\n\n${h.name}:`;
        h.rooms.filter(isUnderThreshold(PRICE_THRESHOLD)).forEach((r) => {
          msg += `\n    ${r.name} - £${r.price} (${r.remaining} left)`;
        });
      });

      log.info(msg);
      await ses.notify(msg);
      notified = true;
    }

    // Monitor metric
    const lowestPrice = hotels.reduce(
      (acc, hotel) => {
        const price = getHotelCheapestPrice(hotel);
        return price < acc ? price : acc;
      },
      Infinity,
    );
    updateMetrics({ lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice });

    // Upload data for website
    const s3Data = { hotels, updatedAt: d.toISOString() };
    await s3.putObject('public-files.chrislewis.me.uk', 'data/z-hotel.json', JSON.stringify(s3Data, null, 2));

    // Write CSV file where column names are hotel names and each row is the latest lowest price
    const values = [
      d.getTime(),
      ...hotels.map((h) => {
        const price = getHotelCheapestPrice(h);
        return price === Infinity ? 0 : price;
      }),
    ];
    await csv.appendRow(OUTPUT_FILE, CSV_HEADINGS, values);

    log.info(`Lowest price: £${lowestPrice}`);
  } catch (e) {
    log.error('z-hotel.js error:');
    log.error(e);
  }
};
