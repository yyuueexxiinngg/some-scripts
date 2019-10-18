## create-share-teamdrive.ts
Script to create a team drive and share to a email address.
0. Install the dependencies from both top-level and ../google/ directory.
1. Run `npm run build` in top-level directory to build javascript.
2. Get your client ID and client secret following [Google nodejs quickstart](https://developers.google.com/drive/api/v3/quickstart/nodejs) 
3. Download and name your credentials as `credentials.json` and put into credentials directory.
4. `node create-share-teamdrive.js -n 'TeamDriveName' -u 'EmailAddressToShareWith'`

Or run with ts-node without build.