const domainID = "YOUR_DOMAIN_ID";   // "xUCN:AP-SEOUL-1-AD-1"
const imageID = "YOUR_IMAGE_ID";   // "ocid1.image.oc1.ap-seoul-1.xxxxxxxxxxxxxx"
const subnetID = "YOUR_SUBNET_ID"; // "ocid1.subnet.oc1.ap-seoul-1.xxxxxxxxxxxxxx"
const shape = "YOUR_SHAPE_ID";  // "VM.Standard.E2.1.Micro"
const sshKey = "YOUR_SSH_KEY";  // "ssh-rsa xxxxxxxxxxxxxx"
const compartmentID = "YOUR_COMPARTMENT_ID";  // "ocid1.tenancy.oc1..xxxxxxxxxxxxxx"
const name1 = "free-kr1";
const name2 = "free-kr2";
const sleepTime = 5000; // ms


const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const readFile = fs.existsSync("./oracle-cloud.json") ? fs.readFileSync("./oracle-cloud.json") : `{"loopTime1":0,"loopTime2":0}`;
const save = JSON.parse(readFile.toString());
let loopTime1 = save.loopTime1;
let loopTime2 = save.loopTime2;
let isMachine1 = true;
let machine1Finished = false;
let machine2Finished = false;

async function execute(callback) {
  return new Promise(async resolve => {
    try {
      if (isMachine1) {
        if (machine1Finished) {
          resolve(false);
          return;
        }
        loopTime1++;
      } else {
        if (machine2Finished) {
          resolve(false);
          return;
        }
        loopTime2++;
      }

      const cmd = `oci compute instance launch --availability-domain ${domainID} --display-name ${
        isMachine1 ? name1 : name2
      } --image-id ${imageID} --subnet-id ${subnetID}  --shape ${shape} --assign-public-ip true --metadata '{"ssh_authorized_keys": "${sshKey}"}' --compartment-id ${compartmentID}`
      const result = await exec(cmd);
      callback(result, resolve);
    } catch (err) {
      callback(err, resolve);
    }
  });
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function callback(result, resolve) {
  console.log(
    `${name1}: ${loopTime1} ${
      machine1Finished ? "Finished!" : "Creating"
    }        ${name2}: ${loopTime2} ${machine2Finished ? "Finished!" : "Creating"}`
  );
  if (result.stderr) {
    console.log(`Err: ${isMachine1 ? name1 : name2}`);
    const jsonGroup = result.stderr
      .toString()
      .match(/\{(?:[^{}]|(\{(?:[^{}]|(\{[^{}]*\}))*\}))*\}/);
    try {
      const json = JSON.parse(jsonGroup[0]);
      console.log(json.status, json.message);
    } catch (e) {
    }
    resolve(true);
  } else if (result.stdout) {
    if (isMachine1) {
      machine1Finished = true;
    } else {
      machine2Finished = true;
    }
    console.log("Out");
    resolve(true);
  }
}

async function init() {
  console.log("Started");
  while (!machine1Finished || !machine2Finished) {
    const isExecuted = await execute(callback);
    isMachine1 = !isMachine1;
    if (isExecuted) {
      fs.writeFileSync(
        "./oracle-cloud.json",
        JSON.stringify({loopTime1: loopTime1, loopTime2: loopTime2})
      );
      await sleep(sleepTime);
    }
  }
}

init();
// By yyuueexxiinngg
// Link https://github.com/yyuueexxiinngg/some-scripts/blob/master/oracle/oracle-cloud.js