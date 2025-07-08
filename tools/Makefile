# Makefile for Profil3r Tools

.PHONY: install build test clean validate health-check

# Install all dependencies
install:
	npm install
	npm run install-all

# Build all projects
build:
	npm run build

# Run all tests
test:
	npm run test

# Run validation for all languages
validate:
	npm run validate-all

# Health check for services
health-check:
	npm run health-check

# Clean up build artifacts
clean:
	rm -rf node_modules
	rm -rf */node_modules
	rm -rf */*/node_modules
	rm -rf cypress/videos
	rm -rf cypress/screenshots

# Start all services
start:
	npm run start-services

# Run Cypress tests in headless mode
test-e2e:
	npm run test-e2e

# Open Cypress test runner
test-e2e-open:
	npm run test-e2e-open

# Full CI pipeline
ci: install validate build test

# Development setup
dev: install build start
