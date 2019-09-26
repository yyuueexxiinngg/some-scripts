# Node scripts
Just some random scripts

#### cloudflare-warp-plus-aff.js
Register fake cloudflare 1.1.1.1 accnount to get referrer bandwidth.

Config your referrer id and times to loop:
```javascript
const referrer = "########## AFF ID ##########";
const timesToLoop = 10;
```
then `node cloudflare-warp-plus-aff.js`