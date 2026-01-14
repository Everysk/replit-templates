###############################################
############ VSCode DEV Environment ###########
###############################################

# Using a prebuild image with Everysk Development features.
FROM ghcr.io/everysk/devcontainers-base:v1 AS container_template

# Install dependencies
COPY requirements.txt /tmp/requirements.txt
RUN /usr/local/bin/pip3 --no-cache-dir install -r /tmp/requirements.txt

# Allow running as non-root in local mode.
RUN chmod -R a+rwx /usr/local/lib/python3.11/site-packages

RUN apt-get update && \
    apt-get -y dist-upgrade && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get -y autoremove && \
    apt-get -y autoclean && \
    rm -rf /var/lib/apt/lists/*
