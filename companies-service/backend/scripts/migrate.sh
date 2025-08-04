#!/bin/sh

echo "Waiting for database to be ready..."
sleep 5

echo "Checking database connection..."
# Tentar conectar ao banco algumas vezes
for i in 1 2 3 4 5; do
  echo "Attempt $i to connect to database..."
  if npm run typeorm -- query "SELECT 1" -d ormconfig.ts > /dev/null 2>&1; then
    echo "Database connection successful!"
    break
  fi
  if [ $i -eq 5 ]; then
    echo "Failed to connect to database after 5 attempts. Exiting."
    exit 1
  fi
  sleep 2
done

echo "Running migrations..."
if npm run migration:run; then
  echo "Migrations completed successfully!"
else
  echo "Migration failed!"
  exit 1
fi

echo "Starting application..."
npm run start:dev 