#!/usr/bin/env bash

set -euo pipefail

case ${1:-} in
    deploy)
        python "${PROJECT_ROOT}"/run.py deploy
        ;;
    *)
        echo "Usage: entrypoint.sh deploy"
        exit 1
        ;;
esac
