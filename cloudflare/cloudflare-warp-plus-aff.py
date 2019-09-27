import requests
import json
import datetime
import random
import string

referrer = "########### AFF ID ###########"
timesToLoop = 10
retryTimes = 5


def genString(stringLength):
    letters = string.ascii_letters + string.digits
    return ''.join(random.choice(letters) for i in range(stringLength))


url = 'https://api.cloudflareclient.com/v0a745/reg'


def run():
    install_id = genString(11)
    body = {"key": "{}=".format(genString(42)),
            "install_id": install_id,
            "fcm_token": "{}:APA91b{}".format(install_id, genString(134)),
            "referrer": referrer,
            "warp_enabled": False,
            "tos": datetime.datetime.now().isoformat()[:-3] + "+07:00",
            "type": "Android",
            "locale": "zh-CN"}

    bodyString = json.dumps(body)

    headers = {'Content-Type': 'application/json; charset=UTF-8',
               'Host': 'api.cloudflareclient.com',
               'Connection': 'Keep-Alive',
               'Accept-Encoding': 'gzip',
               'User-Agent': 'okhttp/3.12.1'
               }

    r = requests.post(url, data=bodyString, headers=headers)
    return r


for i in range(timesToLoop):
    result = run()
    if result.status_code == 200:
        print(i + 1, "OK")
    else:
        print(i + 1, "Error")
        for r in range(retryTimes):
            retry = run()
            if retry.status_code == 200:
                print(i + 1, "Retry #" + str(r + 1), "OK")
                break
            else:
                print(i + 1, "Retry #" + str(r + 1), "Error")
                if r == retryTimes - 1:
                    exit()
