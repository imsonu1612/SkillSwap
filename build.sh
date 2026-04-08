#!/bin/bash

# Install client dependencies and build only
npm --prefix client install --legacy-peer-deps --no-audit --no-fund

# Set CI=false for build to prevent treating warnings as errors
export CI=false
npm --prefix client run build

# Output success message
echo "Build completed successfully!"