import assert from "assert";
import { drive_v3, google } from "googleapis";
import minimist from "minimist";
import GoogleClient from "../googleClient";
(async () => {
  const args = minimist(process.argv.slice(2));
  assert(args.n, "Please specify drive name");
  const driveName = args.n;
  assert(args.u, "Please specify email address to share with");
  const email = args.u;
  const gc = new GoogleClient({
    credentialsPath: "../credentials/credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive"],
    tokenPath: "../credentials/token.json"
  });
  console.log("Initializing Google Client");
  await gc.init();
  const drive = google.drive({ version: "v3", auth: gc.oAuth2Client });
  const { data } = await drive.about.get({
    fields: "user,canCreateTeamDrives,canCreateDrives"
  });
  if (!data.canCreateTeamDrives || !data.canCreateDrives) {
    console.log("Input account does not has privileged to create team drive.");
    process.exit(-1);
  }
  console.log(`Using ${data.user.emailAddress} to create team drive.`);
})();
