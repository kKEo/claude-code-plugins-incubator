# Continuous integration

Pull requests run the same script in GitHub Actions and cannot be merged when it fails.

The workflow is `.github/workflows/test.yml`. On every pull request it checks out the code,
installs pytest and runs `./run-tests.sh` on `ubuntu-latest`.
