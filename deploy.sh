#!/bin/bash

# Pull latest changes from repository
git pull

# Install PHP dependencies
composer install --no-interaction --prefer-dist --optimize-autoloader

# Run database migrations
php artisan migrate --force

# Install and build frontend assets
npm install
npm run build
