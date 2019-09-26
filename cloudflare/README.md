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