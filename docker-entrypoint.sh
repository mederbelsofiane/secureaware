#!/bin/sh
set -e

echo "Starting Security Awareness Platform..."
echo "Waiting for database..."

# Wait for PostgreSQL
until nc -z db 5432 2>/dev/null; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
npx prisma db push --skip-generate 2>/dev/null || true

echo "Starting application..."
exec "$@"
