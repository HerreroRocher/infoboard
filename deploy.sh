#!/bin/bash


# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Error: No commit message provided."
  echo "Usage: ./deploy.sh \"Commit message\""
  exit 1
fi

# Add all changes to git
git add *

# Commit changes with the provided message
git commit -m "$1"

# Push changes to the repository
git push

# Deploy the project
npm run deploy

echo "New version pushed to github and published to public website."
