#!/bin/bash

# Ensure no uncommitted changes
git diff-index --quiet HEAD -- || { echo "Uncommitted changes detected. Aborting."; exit 1; }

# Read current version
current_version=$(awk -F \" '/"version": ".+"/ { print $4; exit; }' package.json)

# Ask user for new version and message
read -p "New version (current: $current_version): " new_version
read -p "Tag message: " tag_message

# Update package.json with new version
sed -i '' "s/\($current_version\).*/$new_version\",/" package.json
git add package.json
git commit -m "Bump package.json version to '$new_version'"

# Create and checkout release branch
release_branch="release/v$new_version"
git checkout -b $release_branch

# Run build and test
npm run build
npm run test

# Commit changes
git add package.json
git commit -m "Release v$new_version"

# Create tag
git tag -a "v$new_version" -m "$tag_message"

# Push branch and tag
git push origin $release_branch
git push origin "v$new_version"

# Publish to npm
npm publish

# Go back to previous branch
git checkout -

# Delete leftover artifact directories 
npm run clean