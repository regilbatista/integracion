#!/bin/sh
envFilename='./.env.production'
nextFolder='./.next/'

# Loop through lines in the environment file
while IFS= read -r line
do
  # Skip comments and empty lines
  if [ "${line:0:1}" == "#" ] || [ -z "$line" ]; then
    continue
  fi

  # Split the line on the equals sign
  configName=$(echo "$line" | cut -d= -f1)
  configValue=$(echo "$line" | cut -d= -f2)

  # Get system environment variable value
  envValue=$(env | grep "^$configName=" | cut -d= -f2- | tr -d '\n')

  # Replace only if both config and env variable exist and config starts with NEXT_PUBLIC
  if [ -n "$configValue" ] && [ -n "$envValue" ] && [[ "$configName" == NEXT_PUBLIC* ]]; then
    echo "Replace: ${configValue} with ${envValue}"
    find "$nextFolder" \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#$configValue#$envValue#g"
  fi
done < "$envFilename"

echo "Starting Nextjs"
exec "$@"
