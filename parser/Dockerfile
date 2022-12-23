FROM php:8.1-fpm

WORKDIR "/app"


# Install Dependencies
RUN apt-get update && \
    apt-get install -y \
            git \
            libfreetype6-dev \
            libjpeg62-turbo-dev \
            libpng-dev \
            curl \
            zip \
            openssl \
            libpq-dev \
            libcurl4-openssl-dev \
            libsodium-dev \
            libzip-dev \
            libicu-dev \
            locales \
            nginx && \
            sed -i -e "s/# $LANG UTF-8/$LANG UTF-8/" /etc/locale.gen && \
            dpkg-reconfigure --frontend=noninteractive locales && \
            update-locale LANG="$LANG" && \
            docker-php-ext-configure gd --with-freetype --with-jpeg && \
            docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql && \
            docker-php-ext-configure curl && \
            docker-php-ext-configure sodium && \
            docker-php-ext-install gd bcmath curl gettext sodium zip pdo pdo_pgsql intl && \
            docker-php-ext-enable gd bcmath curl gettext sodium zip pdo pdo_pgsql intl && \
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
COPY nginx/default.conf /etc/nginx/sites-enabled/default.conf

RUN ["chmod", "+x", "/opt/entrypoint.d/entrypoint.sh"]


RUN ["/bin/bash", "-c", "/opt/entrypoint.d/bootstrap.sh"]

RUN rm /tmp/symfony-cache/ -R -f
RUN composer install --ignore-platform-reqs


ENTRYPOINT ["/bin/bash", "-c", "/opt/entrypoint.d/entrypoint.sh"]