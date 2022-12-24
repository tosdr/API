FROM php:8.1-fpm

WORKDIR "/app"


# Install Dependencies
RUN apt-get update && \
    apt-get install -y \
            git \
            curl \
            zip \
            openssl \
            libcurl4-openssl-dev \
            libzip-dev \
            libicu-dev \
            nginx && \
            dpkg-reconfigure --frontend=noninteractive locales && \
            docker-php-ext-configure curl && \
            docker-php-ext-install bcmath curl zip intl && \
            docker-php-ext-enable bcmath curl zip intl && \
            curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
            apt-get autoremove -y && \
            apt-get clean && \
            rm -rf /tmp/pear && \
            rm -rf /var/cache/apt/archives && \
            rm -rf /var/lib/apt/lists/*

COPY config/php.ini /usr/local/etc/php/conf.d/php_custom.ini

COPY src /app
COPY docker /opt/entrypoint.d

RUN rm /etc/nginx/sites-enabled/default
COPY nginx/docker.conf /etc/nginx/sites-enabled/parser.conf

RUN ["chmod", "+x", "/opt/entrypoint.d/entrypoint.sh"]

RUN rm /tmp/symfony-cache/ -R -f
RUN composer install --ignore-platform-reqs


ENTRYPOINT ["/bin/bash", "-c", "/opt/entrypoint.d/entrypoint.sh"]