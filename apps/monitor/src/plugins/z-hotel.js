const fetch = require('node-fetch');
const { updateMetrics } = require('../modules/metrics');
const { log, ses } = require('../node-common')(['log', 'ses']);

/** Available hotel codes */
const HOTEL_CODES = {
  CoventGarden: 105004,
  Holborn: 105007,
  Picadilly: 105009,
  Strand: 105010,
  TottenhamCourtRoad: 105011,
  Trafalgar: 105012,
  Victoria: 105013,
};

/** Price threshold for alerting */
const PRICE_THRESHOLD = 190;
/** Hour to start notifying from */
const START_H = 8;

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
 * Log metrics for lowest hotel price.
 */
module.exports = async () => {
  try {
    const hotels = await Promise.all(
      Object.entries(HOTEL_CODES).map(([k, v]) => getHotelRooms(k, v)),
    );
    log.debug(JSON.stringify(hotels, null, 2));

    // Reset after midnight
    const hours = new Date().getHours();
    if (hours < 1 && notified) {
      notified = false;
    }

    // Notify if rooms available at acceptable price
    if (!notified && hours >= START_H) {
      let msg = `Rooms available at less than £${PRICE_THRESHOLD}:`;
      const candidates = hotels.filter(
        (h) => h.rooms.some((r) => parseFloat(r.price) < PRICE_THRESHOLD),
      );
      if (candidates.length > 0) {
        candidates.forEach((h) => {
          msg += `\n\n${h.name}:`;
          const rooms = h.rooms.filter((r) => parseFloat(r.price) < PRICE_THRESHOLD);
          rooms.forEach((room) => {
            msg += `\n    ${room.name} - £${room.price} (${room.remaining} left)`;
          });
        });

        log.info(msg);
        await ses.notify(msg);
        notified = true;
      }
    }

    const lowestPrice = hotels.reduce(
      (acc, hotel) => {
        const hotelCheapest = hotel.rooms.reduce((min, room) => {
          const price = parseFloat(room.price);
          return price < min ? price : min;
        }, Infinity);
        return hotelCheapest < acc ? hotelCheapest : acc;
      },
      Infinity,
    );

    updateMetrics({ lowestPrice });

    log.info(`Lowest price: £${lowestPrice}`);
  } catch (e) {
    log.error('z-hotel.js error:');
    log.error(e);
  }
};
