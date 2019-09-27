#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit 2>/dev/null || true

# Taken from https://cache.saurik.com/twitter/wgcf.sh without modification
# Original post: https://twitter.com/saurik/status/1176893448445558784

# this script will connect macOS to Cloudflare Warp using Wireguard
# note: this is *absolutely not* an official client from Cloudflare

# 本脚本使 macOS 通过 Wireguard 连接到 Cloudflare Warp
# 注意: 本脚本为非官方客服端

# Copyright (C) 2019 Jay Freeman (saurik)

# Zero Clause BSD license {{{
#
# Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
# }}}

if ! which jq >/dev/null || ! which wg >/dev/null; then
    echo "you must brew install these first:"
    echo "~\$ brew install jq wireguard-tools"
    exit 0
fi

mkdir -p ~/.wgcf
chmod 700 ~/.wgcf
prv=~/.wgcf/private.key
usr=~/.wgcf/identity.cfg

sudo killall wireguard-go 2>/dev/null || true

declare -a blk
for tun in $(ifconfig -l); do
    [[ ${tun} == utun* ]] || continue
    blk[${tun#utun}]=
done
for ((tun = 0;; ++tun)); do
    [[ -z ${blk[tun]-@} ]] && continue
    tun=utun${tun}
    break
done

sudo wireguard-go "${tun}"

pub=$({ cat "${prv}" 2>/dev/null || wg genkey | tee "${prv}"; } | wg pubkey)
test -n "${pub}"

api=https://api.cloudflareclient.com/v0i1909051800
ins() { vrb=$1; shift; curl -s -H 'user-agent:' -H 'content-type: application/json' -X "${vrb}" "${api}/$@"; }
sec() { ins "$@" -H 'authorization: Bearer '"${reg[1]}"''; }

cfg=($(if [[ -e "${usr}" ]]; then
    reg=($(cat "${usr}"))
    test "${#reg[@]}" -eq 2
    sec GET "reg/${reg[0]}"
else
    reg=($(ins POST "reg" -d '{"install_id":"","tos":"'"$(date -u +%FT%T.000Z)"'","key":"'"${pub}"'","fcm_token":"","type":"ios","locale":"en_US"}' |
        jq -r '.result|.id+" "+.token'))
    test "${#reg[@]}" -eq 2
    echo "${reg[@]}" >"${usr}"
    sec PATCH "reg/${reg[0]}" -d '{"warp_enabled":true}'
fi | jq -r '.result.config|(.peers[0]|.public_key+" "+.endpoint.v4)+" "+.interface.addresses.v4'))
test "${#cfg[@]}" -eq 3

end=${cfg[1]%:*}
sudo route -n delete "${end}" 2>/dev/null || true
gtw=$(route -n get "${end}" | sed -e '/^ *gateway: /!d;s///')
sudo route -n add "${end}" "${gtw}"

# XXX: maybe add route bypass for addresses listed from `ins GET "client_config"`

sudo ifconfig "${tun}" inet "${cfg[2]}" "${cfg[2]}" netmask 255.255.255.255
sudo wg set "${tun}" private-key "${prv}" peer "${cfg[0]}" endpoint "${cfg[1]}" allowed-ips 0.0.0.0/0
sudo route -n add 0.0.0.0/1 -interface "${tun}"
sudo route -n add 128.0.0.0/1 -interface "${tun}"
