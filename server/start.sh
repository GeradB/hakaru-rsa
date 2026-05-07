#!/bin/bash
# Development startup script
# Copy .env.example to .env and fill in your values before running

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Default port if not set
export PORT=${PORT:-3001}

node server.js
