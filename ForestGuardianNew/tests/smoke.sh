#!/bin/sh
# Syntax checks: run from the project root on a machine with PHP and Node.
set -e
for f in server/*.php index.php; do php -l "$f"; done
for f in js/*.js; do node --check "$f"; done
printf 'Syntax checks passed. Manual browser/API tests are still required.\n'
