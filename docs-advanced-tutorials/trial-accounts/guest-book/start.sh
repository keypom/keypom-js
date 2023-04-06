#!/bin/sh

GREEN='\033[1;32m'
NC='\033[0m' # No Color

CONTRACT_ACCOUNT_FILE="contract.env"

start () {
  echo The app is starting!
  env-cmd -f $CONTRACT_ACCOUNT_FILE parcel index.html --open
}

alert () {
  echo "======================================================"
  echo "It looks like you forgot to deploy your contract"
  echo ">> Run ${GREEN}'npm run deploy'${NC} from the 'root' directory"
  echo "======================================================"
}

if [ -f "$CONTRACT_ACCOUNT_FILE" ]; then
  start
else
  alert
fi
