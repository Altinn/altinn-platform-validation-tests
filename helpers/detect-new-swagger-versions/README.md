This is a simple script to help us try to keep up to date with Swagger docs changes.

The goal is to let it run as a Github Action once a week and receive a Slack alert everytime a change is detected.

We need to update the clients/ and building_blocks/ folders to match the new changes.

Eventually also update tests.

run `go run .` in order to update the state file and download the new swagger docs versions.

Exit codes:
    0 = no changes
    1 = script error
    2 = change detected
