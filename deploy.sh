#!/bin/bash
set -e

sudo cp Caddyfile /etc/caddy/sites/conspect.caddy
sudo systemctl reload caddy
