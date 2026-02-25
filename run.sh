#!/usr/bin/bash
set -e

if [[ "$1" == "--pull" ]]; then
    echo "Pulling latest changes"
    git pull
fi

echo "Building TypeScript"
cd public/ts
tsc -b

echo "Starting server"
cd ../..
go run .

