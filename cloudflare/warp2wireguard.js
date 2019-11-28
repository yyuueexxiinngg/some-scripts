const publicKey = "Put your WireGuard public key here";
const privateKey = "Put your WireGuard private key here";
const referrer = "Put referrer id here to get 1GB quota start with warp plus";

if (!publicKey.endsWith("=") || !privateKey.endsWith("=")) {
  console.error("Please specify WireGuard private key, public key.");
  process.exit(1);
}

const https = require("https");
const zlib = require("zlib");
const fs = require("fs");
const util = require("util");

let warpConf = null;

async function run() {
  let userData = {};

  if (fs.existsSync("./warp-conf.json")) {
    warpConf = JSON.parse(fs.readFileSync("./warp-conf.json").toString());
  } else {
    warpConf = {
      id: null,
      publicKey: publicKey, // WireGuard public key
      token: null, // Cloudflare access token
      isWarpPlusEnabled: null
    };
  }

  if (!warpConf.id) {
    console.log("No ID found, registering...");
    userData = await reg();
    console.log("Successfully registered:");
    console.log(util.inspect(userData, false, null, true));
  } else {
    console.log("Getting user data...");
    const res = await getInfo(warpConf.id, warpConf.token);
    userData = res.result;
    if (
      !warpConf.isWarpPlusEnablsed && // If saved record indicate using free version of Cloudflare Warp
      userData.account &&
      (userData.account.premium_data || data.account.warp_plus)
    ) {
      warpConf.isWarpPlusEnabled = true;
      fs.writeFileSync("./warp-conf.json", JSON.stringify(warpConf));
    }
    console.log("Successfully fetched data:");
    if (process.argv[2] && process.argv[2] === "q") {
      if (warpConf.isWarpPlusEnabled) {
        console.log(
          "\x1b[36m%s\x1b[0m",
          "WARP PLUS BANDWIDTH LEFT:",
          userData.account.quota / 1000000000,
          "GB"
        );
      } else {
        console.log(
          "\x1b[36m%s\x1b[0m",
          "You are using free version of Cloudflare Warp, no bandwidth limit, you can referrer others using your ID to obtain quota to upgrade to Cloudflare Warp Plus."
        );
      }
      process.exit(0);
    }
    console.log(util.inspect(userData, false, null, true));
  }

  const wireGuardConf = `
[Interface]
PrivateKey = ${privateKey}
# PublicKey = ${publicKey}
Address = ${userData.config.interface.addresses.v4}
# Address = ${userData.config.interface.addresses.v6}
DNS = 1.1.1.1

[Peer]
PublicKey = ${userData.config.peers[0].public_key}
Endpoint = ${userData.config.peers[0].endpoint.v4}
# Endpoint = ${userData.config.peers[0].endpoint.v6}
# Endpoint = ${userData.config.peers[0].endpoint.host}
AllowedIPs = 0.0.0.0/0
`;

  console.log("Config: ");
  console.log(wireGuardConf);
  fs.writeFileSync("./wireguard-cloudflare-warp.conf", wireGuardConf);
  console.log(
    "Config saved, check wireguard-cloudflare-warp.conf in current dir."
  );

  if (warpConf.isWarpPlusEnabled) {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "WARP PLUS BANDWIDTH LEFT:",
      userData.account.quota / 1000000000,
      "GB"
    );
  } else {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "You are using free version of Cloudflare Warp, no bandwidth limit, you can referrer others using your ID to obtain quota to upgrade to Cloudflare Warp Plus."
    );
  }
}

async function getInfo(id, token) {
  return new Promise(async resolve => {
    const result = await httpRequest({
      hostname: "api.cloudflareclient.com",
      port: 443,
      path: `/v0i1909221500/reg/${id}`,
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
        Host: "api.cloudflareclient.com",
        "Accept-Encoding": "gzip",
        "Accept-Language": "Language",
        "User-Agent": "1.1.1.1/1909221500.1 CFNetwork/978.0.7 Darwin/18.7.0"
      }
    });

    if (result.success) {
      const data = result.payload;
      resolve(data);
    } else {
      console.error("Unable to get user info.");
      process.exit(1);
    }
  });
}

async function reg() {
  return new Promise(async resolve => {
    const install_id = genString(11);
    const postData = {
      key: publicKey,
      install_id: install_id,
      fcm_token: `${install_id}:APA91b${genString(134)}`,
      referrer: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        referrer
      )
        ? referrer
        : "",
      warp_enabled: true,
      tos: new Date().toISOString().replace("Z", "+08:00"),
      type: "Android",
      locale: "en_US"
    };

    const result = await httpRequest(
      {
        hostname: "api.cloudflareclient.com",
        port: 443,
        path: "/v0a745/reg",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Host: "api.cloudflareclient.com",
          Connection: "Keep-Alive",
          "Accept-Encoding": "gzip",
          "User-Agent": "okhttp/3.12.1"
        }
      },
      postData
    );

    if (result.success) {
      const data = result.payload;
      warpConf.id = data.id;
      warpConf.token = data.token;

      if (data.account && (data.account.premium_data || data.account.warp_plus))
        warpConf.isWarpPlusEnabled = true;

      fs.writeFileSync("./warp-conf.json", JSON.stringify(warpConf));

      resolve(data);
    } else {
      console.error("Unable to register new account.");
      process.exit(1);
    }
  });
}

function httpRequest(options, data = undefined) {
  return new Promise(resolve => {
    const bodyString = data ? JSON.stringify(data) : data;
    const req = https.request(options, res => {
      const gzip = zlib.createGunzip();
      const buffer = [];
      res.pipe(gzip);
      gzip
        .on("data", function(data) {
          buffer.push(data.toString());
        })
        .on("end", function() {
          const res = JSON.parse(buffer.join(""));
          resolve({ success: true, payload: res });
        })
        .on("error", function(e) {
          resolve({ success: false, payload: e });
        });
    });

    req.on("error", e => {
      resolve({ success: false, payload: e });
    });

    if (bodyString) req.write(bodyString);
    req.end();
  });
}

function genString(length) {
  // https://gist.github.com/6174/6062387#gistcomment-2651745
  return [...Array(length)]
    .map(i => (~~(Math.random() * 36)).toString(36))
    .join("");
}

run();
// Original link: https://github.com/yyuueexxiinngg/some-scripts/blob/master/cloudflare/warp2wireguard.js
