#!/bin/bash
set -e

# 运行所有 PHP 单元测试
for plugin in src/career-baist-initialization src/career-baist-main-plugin src/career-baist-plugin; do
  if [ -f "$plugin/phpunit.xml" ]; then
    echo "Running PHPUnit for $plugin..."
    vendor/bin/phpunit --configuration "$plugin/phpunit.xml"
  fi
done

# 运行 React/JS 测试
if [ -f "src/career-baist-plugin/jest.config.js" ]; then
  echo "Running Jest for src/career-baist-plugin..."
  cd src/career-baist-plugin && npm install && npm test
  cd -
fi

echo "All tests completed."
