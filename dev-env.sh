#!/bin/bash

install_function () {
  cd "$GITPOD_REPO_ROOT/functions/$1" || exit
  if test -f "$PWD/package.json"; then
    npm install
  fi
  if test -f "$PWD/composer.json"; then
    composer install
  fi

  cd "$GITPOD_REPO_ROOT" || exit
}

npm i -g appwrite-cli
appwrite client --endpoint "$APPWRITE_BASE" --projectId "$APPWRITE_PROJECT" --key "$APPWRITE_API_KEY"

install_function "API Metrics"

install_function "Case/GET/v1"

install_function "Service/GET/v1"

install_function "Spam/DELETE/v1"
install_function "Spam/GET/v1"
install_function "Spam/POST/v1"