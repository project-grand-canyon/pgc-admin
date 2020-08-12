#!/bin/bash

export PATH=$PATH:node_modules/.bin

start() {
  react-app-rewired start
}

local() {
  export REACT_APP_API_ENDPOINT=http://localhost:8080/api/
  echo "Starting server, talking to API at $REACT_APP_API_ENDPOINT"
  react-app-rewired start
}

build() {
  react-app-rewired build
}

test() {
  react-app-rewired test
}

cypress-open() {
  cypress open --config 'baseUrl=http://localhost:3000' "$@"
}

cypress-run() {
  cypress run --config 'baseUrl=http://localhost:3000' "$@"
}

"$@"
