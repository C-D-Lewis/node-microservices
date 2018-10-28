const log = require('./log');

module.exports = (text, beforeArr, after) => {
  let copy = `${text}`;
  let index = 0;
  beforeArr.forEach((item) => {
    index = copy.indexOf(item);
    if(index === -1) throw new Error(`Unable to find ${item} when scraping`);

    copy = copy.substring(index);
  });

  copy = copy.substring(beforeArr[beforeArr.length - 1].length);
  return copy.substring(0, copy.indexOf(after));
};
