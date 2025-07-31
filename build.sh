#!/bin/bash

# Install dependencies
npm install

# Install client dependencies and build
cd client
npm install
npm run build
cd ..

# Output success message
echo "Build completed successfully!"