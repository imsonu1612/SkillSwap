#!/bin/bash

# Install dependencies
npm install --legacy-peer-deps --no-audit --no-fund

# Install client dependencies and build
cd client
npm install --legacy-peer-deps --no-audit --no-fund

# Set CI=false for build to prevent treating warnings as errors
export CI=false
npm run build
cd ..

# Output success message
echo "Build completed successfully!"