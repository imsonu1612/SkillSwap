#!/bin/bash

# Install dependencies
npm install

# Install client dependencies and build
cd client
npm install

# Set CI=false for build to prevent treating warnings as errors
export CI=false
npm run build
cd ..

# Output success message
echo "Build completed successfully!"