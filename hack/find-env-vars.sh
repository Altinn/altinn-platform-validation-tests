#!/usr/bin/env bash

find ./K6 -name "*.js" -type f | while read -r file; do
  vars=$(grep -oP '__ENV\.\K[A-Za-z0-9_]+' "$file" | sort -u)

  if [ -n "$vars" ]; then
    echo "$file"
    echo "$vars" | sed 's/^/  /'
    echo
  fi
done