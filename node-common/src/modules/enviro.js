const { execSync } = require('child_process');

/**
 * Call the enviro-read-all.py script to get all sensor readings.
 *
 * @returns {object} Object of all sensor readings.
 */
const readAll = () => {
  try {
    const stdout = execSync(`python ${`${__dirname}/../lib/enviro-read-all.py`}`).toString();
    const [rawTemp, adjTemp, pressure, humidity, lux, proximity] = stdout.split('\n');

    return {
      rawTemp: parseFloat(parseFloat(rawTemp).toFixed(3)),      // °C
      adjTemp: parseFloat(parseFloat(adjTemp).toFixed(3)),      // °C
      pressure: parseFloat(parseFloat(pressure).toFixed(3)),    // hPa
      humidity: parseFloat(parseFloat(humidity).toFixed(3)),    // %
      lux: parseFloat(parseFloat(lux).toFixed(3)),              // Lumens
      proximity: parseFloat(parseFloat(proximity).toFixed(3)),
    };
  } catch (error) {
    console.log(error.message.slice(0, 128));
    return {
      rawTemp: 0,
      adjTemp: 0,
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
