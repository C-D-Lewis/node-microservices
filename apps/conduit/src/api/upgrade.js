const { execSync } = require('child_process');

const DELAY_MS = 10000;

module.exports = async (req, res) => {
  try {
    // Git update
    execSync('git checkout ../..');
    execSync('git reset --hard HEAD');
    execSync('git pull origin master');

    // Delayed reboot
    setTimeout(() => execSync('sudo reboot'), DELAY_MS);  

    res.status(200);
    res.json({ content: 'Restarting in 10 seconds' });
  } catch (e) {
    log.error(e);
    res.status(500).
  }
};
