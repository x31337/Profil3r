const fs = require('fs');
const path = require('path');

/**
 * Recursively find files matching a pattern in a directory
 * @param {string} directory - Directory to search in
 * @param {string} pattern - File pattern to match (supports wildcards)
 * @returns {Array<string>} Array of file paths that match the pattern
 */
function findFiles(directory, pattern) {
  const files = [];
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip cache directories and other unwanted directories
      if (
        item === '__pycache__' ||
        item === '.git' ||
        item === 'node_modules' ||
        item === '.pytest_cache'
      ) {
        continue;
      }
      files.push(...findFiles(fullPath, pattern));
    } else if (item.match(pattern.replace('*', '.*'))) {
      // Skip cache files and other unwanted files
      if (
        item.endsWith('.pyc') ||
        item.endsWith('.pyo') ||
        item.endsWith('.pyd') ||
        item.includes('.cpython-') ||
        item.startsWith('.') ||
        item.endsWith('.log')
      ) {
        continue;
      }
      files.push(fullPath);
    }
  }

  return files;
}

module.exports = {
  findFiles,
};
