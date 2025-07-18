const { createAlert } = require('../modules/alert');

let alert;

module.exports = () => {
  if (alert) return alert.test();

  alert = createAlert(
    'test alert',
    async () => {
      const success = Math.random() > 0.9; // Simulate a random success or failure
      console.log({ success })

      return success;
    },
    (result) => `Test alert result: ${result}`,
  );

  return alert.test();
};
