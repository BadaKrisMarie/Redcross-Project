Set-Content -Path "Dockerfile" -Value @"
FROM php:8.2-cli

RUN apt-get update && apt-get install -y curl zip unzip git nodejs npm

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev

RUN npm install && npm run build

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=`${PORT:-8000}
"@