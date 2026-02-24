#!/usr/bin/bash
set -e

echo "Pulling latest changes"
git pull

echo "Building TypeScript"
cd public/ts
tsc -b

echo "Starting server"
cd ../..
go run .

