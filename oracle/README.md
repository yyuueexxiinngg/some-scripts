# Oracle related

### oracle-cloud.js
Node script to execute cmd from Oracle official cli to create two VM instances.
Config your desired info:
```javascript
const domainID = "YOUR_DOMAIN_ID";   // "xUCN:AP-SEOUL-1-AD-1"
const imageID = "YOUR_IMAGE_ID";   // "ocid1.image.oc1.ap-seoul-1.xxxxxxxxxxxxxx"
const subnetID = "YOUR_SUBNET_ID"; // "ocid1.subnet.oc1.ap-seoul-1.xxxxxxxxxxxxxx"
const shape = "YOUR_SHAPE_ID";  // "VM.Standard.E2.1.Micro"
const sshKey = "YOUR_SSH_KEY";  // "ssh-rsa xxxxxxxxxxxxxx"
const compartmentID = "YOUR_COMPARTMENT_ID";  // "ocid1.tenancy.oc1..xxxxxxxxxxxxxx"
const name1 = "free-kr1";
const name2 = "free-kr2";
const sleepTime = 5000; // ms
```
then `node orcale-cloud.js`
