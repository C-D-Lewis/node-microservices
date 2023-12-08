const fs = require('fs');
const fetch = require('node-fetch');
const { log } = require('../node-common')(['log']);

const OUTPUT_FILE = './JingleJam2023.csv';

/**
 * Log the Jingle Jame charity donations amount to CSV.
 */
module.exports = async () => {
  try {
    const res = await fetch('https://api.tiltify.com/', {
      credentials: 'omit',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        Accept: '*/*',
        'Accept-Language': 'en-GB,en;q=0.5',
        'content-type': 'application/json',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
      },
      body: '{"operationName":"get_cause_and_fe_by_slug","variables":{"causeSlug":"jingle-jam","feSlug":"jingle-jam-2023"},"query":"query get_cause_and_fe_by_slug($feSlug: String!, $causeSlug: String!) {\\n  cause(slug: $causeSlug) {\\n    id\\n    causeFactPublicId\\n    name\\n    slug\\n    trackers\\n    avatar {\\n      alt\\n      height\\n      width\\n      src\\n      __typename\\n    }\\n    social {\\n      discord\\n      facebook\\n      instagram\\n      snapchat\\n      tiktok\\n      twitter\\n      website\\n      youtube\\n      __typename\\n    }\\n    paymentMethods {\\n      type\\n      currency\\n      __typename\\n    }\\n    paymentOptions {\\n      currency\\n      monthlyGiving\\n      __typename\\n    }\\n    __typename\\n  }\\n  fundraisingEvent(slug: $feSlug, causeSlug: $causeSlug) {\\n    publicId\\n    legacyFundraisingEventId\\n    name\\n    slug\\n    trackers\\n    description\\n    supportable\\n    sponsorList {\\n      image {\\n        alt\\n        height\\n        src\\n        width\\n        __typename\\n      }\\n      __typename\\n    }\\n    image {\\n      src\\n      __typename\\n    }\\n    video\\n    avatar {\\n      src\\n      __typename\\n    }\\n    amountRaised {\\n      currency\\n      value\\n      __typename\\n    }\\n    totalAmountRaised {\\n      currency\\n      value\\n      __typename\\n    }\\n    goal {\\n      currency\\n      value\\n      __typename\\n    }\\n    visibility {\\n      raised\\n      goal\\n      donate\\n      toolkit {\\n        url\\n        __typename\\n      }\\n      teamLeaderboard {\\n        visible\\n        __typename\\n      }\\n      userLeaderboard {\\n        visible\\n        __typename\\n      }\\n      __typename\\n    }\\n    publishedCampaignsCount\\n    publishedCampaigns(limit: 50) {\\n      edges {\\n        cursor\\n        node {\\n          ... on Campaign {\\n            publicId\\n            name\\n            slug\\n            live\\n            cause {\\n              name\\n              avatar {\\n                src\\n                __typename\\n              }\\n              __typename\\n            }\\n            user {\\n              id\\n              username\\n              slug\\n              avatar {\\n                src\\n                alt\\n                __typename\\n              }\\n              __typename\\n            }\\n            avatar {\\n              src\\n              alt\\n              __typename\\n            }\\n            totalAmountRaised {\\n              value\\n              currency\\n              __typename\\n            }\\n            goal {\\n              value\\n              currency\\n              __typename\\n            }\\n            cardImage {\\n              src\\n              alt\\n              __typename\\n            }\\n            __typename\\n          }\\n          ... on TeamEvent {\\n            publicId\\n            name\\n            slug\\n            currentSlug\\n            live\\n            cause {\\n              name\\n              avatar {\\n                src\\n                __typename\\n              }\\n              __typename\\n            }\\n            team {\\n              id\\n              name\\n              slug\\n              avatar {\\n                src\\n                alt\\n                __typename\\n              }\\n              __typename\\n            }\\n            avatar {\\n              src\\n              alt\\n              __typename\\n            }\\n            totalAmountRaised {\\n              value\\n              currency\\n              __typename\\n            }\\n            goal {\\n              value\\n              currency\\n              __typename\\n            }\\n            cardImage {\\n              src\\n              alt\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    social {\\n      discord\\n      facebook\\n      instagram\\n      snapchat\\n      tiktok\\n      twitter\\n      website\\n      youtube\\n      __typename\\n    }\\n    paymentOptions {\\n      currency\\n      monthlyGiving\\n      __typename\\n    }\\n    incentives {\\n      id\\n      title\\n      description\\n      fairMarketValue {\\n        value\\n        currency\\n        __typename\\n      }\\n      amount {\\n        value\\n        currency\\n        __typename\\n      }\\n      image {\\n        src\\n        alt\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}"}',
      method: 'POST',
      mode: 'cors',
    });

    const json = await res.json();
    const { value } = json.data.fundraisingEvent.totalAmountRaised;
    const now = Date.now();

    // Write CSV file
    let stream;
    if (!fs.existsSync(OUTPUT_FILE)) {
      // New file, add headers too
      stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' });
      stream.end('"timestamp","value"\n');
    }

    stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });
    stream.end(`"${now}","${value}"\n`);

    log.info(`Logged '${value}'`);
  } catch (e) {
    log.error(`GET ${URL} error:`);
    log.error(e);
  }
};
