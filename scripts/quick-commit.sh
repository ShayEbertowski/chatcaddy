#!/bin/bash

msg="$1"

if [ -z "$msg" ]; then
  echo "Enter a commit message:"
  read msg
fi

git add .
git commit -m "$msg"
git push
