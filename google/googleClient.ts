import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { drive_v3, google, oauth2_v1 } from "googleapis";
import readline from "readline";
import * as types from "./types";
class GoogleClient {
  public oAuth2Client: OAuth2Client;
  private options: types.GoogleClient$Options;

  constructor(options: types.GoogleClient$Options) {
    this.options = options;
    if (!fs.existsSync(options.credentialsPath)) {
      throw new Error("Credentials not exist!");
    }
    const credentialsFile = JSON.parse(
      fs.readFileSync(options.credentialsPath).toString()
    );
    const credentials = credentialsFile.installed || credentialsFile.web;
    this.oAuth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    );
  }
  public async init() {
    await this.authorize();
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   */
  public async getAccessToken(oAuth2Client: OAuth2Client) {
    return new Promise(resolve => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: this.options.scopes[0]
      });
      console.log("Authorize this app by visiting this url:", authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question("Enter the code from that page here: ", (code: string) => {
        rl.close();

        oAuth2Client.getToken(code, (err: any, token: any) => {
          if (err) {
            return console.error("Error retrieving access token", err);
          }
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(this.options.tokenPath, JSON.stringify(token), error => {
            if (error) {
              return console.error(error);
            }
            console.log("Token stored to", this.options.tokenPath);
          });
          this.oAuth2Client = oAuth2Client;
          resolve();
        });
      });
    });
  }
  private async authorize() {
    return new Promise(async (resolve, reject) => {
      if (fs.existsSync(this.options.tokenPath)) {
        this.oAuth2Client.setCredentials(
          JSON.parse(fs.readFileSync(this.options.tokenPath).toString())
        );
        resolve();
      } else {
        await this.getAccessToken(this.oAuth2Client);
        resolve();
      }
    });
  }
}
export default GoogleClient;
