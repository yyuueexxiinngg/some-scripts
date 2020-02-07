// Fake register for referrer to get warp plus bandwidth
const referrer = "YOUR REFERRER ID";
const timesToLoop = 10;
const retryTimes = 5;
// How many sec to sleep, currently rate limit might be apply to per min per ip from my observation.
const sleepSeconds = 60;

const https = require("https");
const zlib = require("zlib");

async function init() {
  for (let i = 0; i < timesToLoop; i++) {
    if (await run()) {
      console.log(i + 1, "OK");
    } else {
      console.log(i + 1, `Error, will sleep for ${sleepSeconds}s`);
      for (let r = 0; r < retryTimes; r++) {
        await sleep(sleepSeconds * 1000);
        if (await run()) {
          console.log(i + 1, "Retry #" + (r + 1), "OK");
          break;
        } else {
          console.log(i + 1, "Retry #" + (r + 1), `Error, will sleep for ${sleepSeconds}s`);
          if (r === retryTimes - 1) {
            return;
          }
        }
      }
    }
  }
}

async function run() {
  return new Promise(resolve => {
    const install_id = genString(11);
    const postData = JSON.stringify({
      key: `${genString(43)}=`,
      install_id: install_id,
      fcm_token: `${install_id}:APA91b${genString(134)}`,
      referrer: referrer,
      warp_enabled: false,
      tos: new Date().toISOString().replace("Z", "+07:00"),
      type: "Android",
      locale: "zh_CN"
    });

    const options = {
      hostname: "api.cloudflareclient.com",
      port: 443,
      path: "/v0a745/reg",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "api.cloudflareclient.com",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip",
        "User-Agent": "okhttp/3.12.1",
        "Content-Length": postData.length
      }
    };

    const req = https.request(options, res => {
      if(res.statusCode === 429) {
        // Too many requests
        resolve(false);
      }
      const gzip = zlib.createGunzip();
      // const buffer = [];
      res.pipe(gzip);
      gzip
        .on("data", function(data) {
          // buffer.push(data.toString());
        })
        .on("end", function() {
          // console.dir(JSON.parse(buffer.join("")));
          resolve(true);
        })
        .on("error", function(e) {
          // console.error(e);
          resolve(false);
        });
    });

    req.on("error", error => {
      // console.error(error);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function genString(length) {
  // https://stackoverflow.com/a/1349426/11860316
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

init();
