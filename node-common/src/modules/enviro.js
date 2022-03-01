const { execSync } = require('child_process');

/**
 * Call the enviro-read-all.py script to get all sensor readings.
 *
 * @returns {object} Object of all sensor readings.
 */
const readAll = () => {
  try {
    const stdout = execSync(`python ${`${__dirname}/../lib/enviro-read-all.py`}`).toString();
    const [temperature, pressure, humidity, lux, proximity] = stdout.split('\n');

    return {
      temperature,  // °C
      pressure,     // hPa
      humidity,     // %
      lux,          // Lumens
      proximity,
    };
  } catch (error) {
    console.log(error.message.slice(0, 128));
    return {
      temperature: 0,
      pressure: 0,
      humidity: 0,
      lux: 0,
      proximity: 0,
    };
  }
};

module.exports = {
  readAll,
};
