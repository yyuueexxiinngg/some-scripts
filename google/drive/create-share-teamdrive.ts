/* tslint:disable:no-bitwise */
import assert from "assert";
import { drive_v3, google } from "googleapis";
import minimist from "minimist";
import GoogleClient from "../googleClient";
(async () => {
  const args = minimist(process.argv.slice(2));
  assert(args.n, "Please specify drive name");
  const driveName = args.n;
  assert(args.u, "Please specify email address to share with");
  const emailToShareWith = args.u;
  const gc = new GoogleClient({
    credentialsPath: "../credentials/credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive"],
    tokenPath: "../credentials/token.json"
  });
  console.log("Initializing Google Client");
  await gc.init();
  const drive = google.drive({ version: "v3", auth: gc.oAuth2Client });
  try {
    const { data } = await drive.about.get({
      fields: "user,canCreateTeamDrives,canCreateDrives"
    });
    if (!data.canCreateTeamDrives || !data.canCreateDrives) {
      console.log(
        "Input account does not has privileged to create team drive."
      );
      process.exit(-1);
    }

    // Create team drive
    console.log(`Using ${data.user.emailAddress} to create team drive.`);
    const randomRequestId = uuidv4();
    const createDriveResult = (await drive.drives.create({
      requestId: randomRequestId,
      requestBody: { name: driveName }
    })).data;
    if (!createDriveResult.id) {
      console.error("Create drive filed");
      process.exit(-1);
    }

    // Get created drive user permission ID
    console.log(`Getting creator permission ID`);
    const getDrivePermissionsResult = (await drive.permissions.list({
      fileId: createDriveResult.id,
      fields: "permissions(id,emailAddress)",
      supportsAllDrives: true
    })).data;
    const currentUserPermissionID = getDrivePermissionsResult.permissions.filter(
      permission => permission.emailAddress === data.user.emailAddress
    )[0].id;

    // Share team drive with email address
    console.log(`Sharing the team drive to ${emailToShareWith}`);
    const createSharePermissionResult = (await drive.permissions.create({
      fileId: createDriveResult.id,
      requestBody: {
        role: "organizer",
        type: "user",
        emailAddress: emailToShareWith
      },
      supportsAllDrives: true
    })).data;
    assert(createDriveResult, "Unable to share the team drive");

    // Delete creator from the team drive
    console.log("Deleting creator from the team drive");
    const deletePermissionResult = (await drive.permissions.delete({
      fileId: createDriveResult.id,
      permissionId: currentUserPermissionID,
      supportsAllDrives: true
    })).data;
  } catch (err) {
    console.error(err);
  }

  console.log("Done");
})();

// https://stackoverflow.com/a/2117523
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    // tslint:disable-next-line:one-variable-per-declaration
    const r = (Math.random() * 16) | 0,
      // tslint:disable-next-line:triple-equals
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
