# Cloudflare related

### cloudflare-warp-plus-aff.js
Register fake cloudflare 1.1.1.1 accnount to get referrer bandwidth.

Config your referrer id and times to loop:
```javascript
const referrer = "########## AFF ID ##########";
const timesToLoop = 10;
```
then `node cloudflare-warp-plus-aff.js`

### cloudflare-warp-plus-aff.py

`pip install requests`

Config your referrer id and times to loop:
```python
referrer = "########### AFF ID ###########"
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