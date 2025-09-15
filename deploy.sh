#!/bin/bash

# Pull latest changes from repository
git pull

# Install PHP dependencies
docker compose exec web composer install --no-interaction --prefer-dist --optimize-autoloader

# Run database migrations
docker compose exec web php artisan migrate --force

# Install and build frontend assets
docker compose exec web npm ci
docker compose exec web npm run build
