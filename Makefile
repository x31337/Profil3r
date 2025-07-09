# Makefile for Profil3r

.PHONY: build test deploy

build: ## Build all language components
	@echo "Building Python dependencies..."
	@pip3 install -r modules/requirements.txt
	@echo "Building Node.js dependencies..."
	@npm --prefix ./js_tools/messenger_bot_framework/fbbot ci
	@npm --prefix ./js_tools/facebook_mass_messenger ci
	@npm --prefix ./OSINT-Framework ci
	@echo "Building Java project..."
	@mvn -f ./scripts/legacy/fb-botmill/pom.xml clean package


test: ## Run tests for all components
	@echo "Running Python tests..."
	@PYTHONPATH=./modules pytest -s --tb=short



deploy: ## Deploy application
	@echo "Deploying applications..."
	@# Add deploy commands here
