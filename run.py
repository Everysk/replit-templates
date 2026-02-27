###############################################################################
#
# (C) Copyright 2026 EVERYSK TECHNOLOGIES
#
# This is an unpublished work containing confidential and proprietary
# information of EVERYSK TECHNOLOGIES. Disclosure, use, or reproduction
# without authorization of EVERYSK TECHNOLOGIES is prohibited.
#
###############################################################################

import os
import sys
import subprocess

PWD = os.getcwd()
PYTHON = sys.executable

ENTRYPOINTS = {
    "deploy": f"{PWD}/scripts/deploy.py",
}

os.environ["PYTHONPATH"] = f"{PWD}:{PWD}/scripts" if os.name != 'nt' else f"{PWD};{PWD}\\scripts"


def run_python(command, params):
    entrypoint = ENTRYPOINTS.get(command)
    if entrypoint:
        subprocess.run([PYTHON, entrypoint] + params, check=True)
    else:
        print(f"Invalid command: {command}")
        sys.exit(1)


def main():
    if len(sys.argv) < 2:
        print("Usage: python run.py deploy")
        sys.exit(1)

    command = sys.argv[1]
    params = sys.argv[2:]

    if command == "deploy":
        try:
            run_python(command, params)
        except subprocess.CalledProcessError:
            print("Deploy failed.")
            sys.exit(1)
    else:
        print(f"Unknown command: {command}")
        print("Usage: python run.py deploy")
        sys.exit(1)


if __name__ == "__main__":
    main()
