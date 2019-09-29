# Cloudflare related

### cloudflare-warp-plus-aff.js
Register fake cloudflare 1.1.1.1 accnount to get referrer bandwidth.

Config your referrer id and times to loop:
```javascript
const referrer = "YOUR REFERRER ID";
const timesToLoop = 10;
```
then `node cloudflare-warp-plus-aff.js`

### cloudflare-warp-plus-aff.py

`pip install requests`

Config your referrer id and times to loop:
```python
referrer = "YOUR REFERRER ID"
timesToLoop = 10
```
then `python cloudflare-warp-plus-aff.py`

### wgcf.sh

Script to connect macOS to Cloudflare warp using Wireguard.
To get started, `brew install jq wireguard-tools`

> If you ```sudo killall wireguard-go``` it will shut down the tunnel and clean up almost all routing changes. One (harmless) route--used to force the Cloudflare WARP endpoint to bypass the tunnel--is left behind; I didn't know a trivial way to always remember which one I added :/.
>
>(I also cache the private key, identity, and authorization tokens used for the account with Cloudflare in your home directory, so you might also want to eventually ```rm -rf ~/.wgcf```. I originally made that cache less automatic, but decided this wasn't trying to be perfect ;P.)
>
> -- <cite>Jay Freeman (saurik)</cite>

### warp2wireguard.js

Script to generate WireGuard config for cloudflare warp.

```javascript
const publicKey = "Put your WireGuard public key here";
const privateKey = "Put your WireGuard private key here";
const referrer = "Must put referrer id here to get start with 1 GB";
```

This script will create `warp-conf.json` at running directory for saving the user token.

#### To get your bandwidth quota info, run `node warp2wireguard.js q`

Generated WireGuard configuration file will be saved at running directory named `wireguard-cloudflare-warp.conf`

### Retrieve_Cloudflare_Warp_Bandwidth.shortcut

iOS shortcut to retrieve bandwidth quota, tested on iOS 12.4
