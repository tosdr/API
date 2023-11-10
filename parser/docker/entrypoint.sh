#!/bin/bash


cd / || exit 1

php-fpm -F -R -D || exit 1
echo "Starting nginx"
nginx -c /etc/nginx/nginx.conf -g "daemon off;"