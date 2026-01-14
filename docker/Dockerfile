############ Base image ############
FROM everyskpackages/everysk_worker_development:latest AS everysk_apps_base

WORKDIR ${PROJECT_ROOT}

# Install dependencies
COPY requirements.txt /tmp/requirements.txt
RUN /usr/local/bin/pip3 --no-cache-dir install -r /tmp/requirements.txt

FROM everysk_apps_base AS everysk_apps_remote

RUN apt-get update && \
    apt-get -y dist-upgrade && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get -y autoremove && \
    apt-get -y autoclean && \
    rm -rf /var/lib/apt/lists/*

COPY . ${PROJECT_ROOT}

ENTRYPOINT [ "/bin/bash", "--login", "-c", "${PROJECT_ROOT}/scripts/entrypoint.sh deploy all" ]

FROM everysk_apps_base AS everysk_apps_tests

ENTRYPOINT [ "/bin/bash", "--login", "-c", "python ${PROJECT_ROOT}/run.py tests" ]
