#!/bin/bash

# Exit if anything fails
set -e

# Add all changes
git add .

# Use first argument as commit message, or prompt if missing
if [ -z "$1" ]; then
  read -p "Commit message: " msg
else
  msg="$1"
fi

# Commit and push
git commit -m "$msg"
git push
