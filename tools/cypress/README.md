# Enhanced Cypress Test Suite

This enhanced Cypress test suite provides comprehensive end-to-end testing for the Profil3r tools with visual regression testing, cross-browser support, mobile viewport testing, and parallel execution capabilities.

## Features

### 1. Visual Regression Testing

- **Plugin**: `cypress-image-snapshot`
- **Snapshots**: Stored in `cypress/snapshots/`
- **Diff Images**: Stored in `cypress/snapshots/diffs/`
- **Configuration**: Customizable threshold settings for pixel differences

### 2. Cross-Browser Testing

- **Browsers**: Chrome, Firefox, Edge
- **Implementation**: GitHub Actions with browser-specific runners
- **Commands**:
  - `npm run test-e2e-chrome`
  - `npm run test-e2e-firefox`
  - `npm run test-e2e-edge`
  - `npm run test-e2e-cross-browser`

### 3. Mobile Viewport Testing

- **Devices**: iPhone 6 (375x667), iPad 2 (768x1024)
- **Commands**:
  - `npm run test-e2e-mobile` (iPhone 6)
  - `npm run test-e2e-tablet` (iPad 2)
- **Custom Commands**: `cy.setMobileViewport(device)`, `cy.testResponsiveDesign()`

### 4. Parallel Test Execution

- **Spec Buckets**: Organized into separate directories for parallel execution
- **Buckets**:
  - `health-checks/` - API health and endpoint testing
  - `osint/` - OSINT Framework UI and functionality
  - `messenger/` - Facebook Mass Messenger and Bot Framework
  - `integration/` - Cross-service integration tests
  - `visual-regression/` - Visual regression testing
  - `mobile/` - Mobile responsiveness testing

### 5. Artifact Storage

- **Videos**: Automatically recorded for all test runs
- **Screenshots**: Captured on test failures
- **Visual Snapshots**: Stored for visual regression testing
- **GitHub Actions**: Automatic artifact upload

## Directory Structure

```
tools/cypress/
├── e2e/
│   ├── health-checks/
│   │   └── api-health.cy.js
│   ├── osint/
│   │   └── osint-framework.cy.js
│   ├── messenger/
│   │   ├── mass-messenger.cy.js
│   │   └── messenger-bot.cy.js
│   ├── integration/
│   │   └── service-integration.cy.js
│   ├── visual-regression/
│   │   └── visual-tests.cy.js
│   └── mobile/
│       └── mobile-responsive.cy.js
├── support/
│   ├── commands.js
│   └── e2e.js
├── screenshots/
├── videos/
├── snapshots/
├── snapshots/diffs/
└── README.md
```

## Usage

### Basic Testing

```bash
# Run all tests
npm run test-e2e

# Open Cypress Test Runner
npm run test-e2e-open
```

### Cross-Browser Testing

```bash
# Test in Chrome
npm run test-e2e-chrome

# Test in Firefox
npm run test-e2e-firefox

# Test in Edge
npm run test-e2e-edge

# Test in all browsers
npm run test-e2e-cross-browser
```

### Mobile Testing

```bash
# Test iPhone 6 viewport
npm run test-e2e-mobile

# Test iPad 2 viewport
npm run test-e2e-tablet
```

### Parallel Testing

```bash
# Run tests in parallel buckets
npm run test-e2e-parallel
```

## Custom Commands

### Visual Regression

```javascript
// Take a visual snapshot
cy.matchImageSnapshot('snapshot-name');

// Test responsive design across devices
cy.testResponsiveDesign(url, testName);
```

### Mobile Viewports

```javascript
// Set mobile viewport
cy.setMobileViewport('iphone-6');
cy.setMobileViewport('ipad-2');
```

### Service Testing

```javascript
// Wait for service availability
cy.waitForService(url);

// Test API endpoint
cy.testAPIEndpoint(endpoint, expectedStatus);

// Fill and submit forms
cy.fillAndSubmitForm(formData);
```

## Configuration

### Cypress Configuration (`cypress.config.js`)

- **Base URL**: `http://localhost:8000`
- **Viewports**: Desktop (1280x720), Mobile viewports configurable
- **Timeouts**: 10 seconds for commands, requests, and responses
- **Videos**: Enabled and stored in `cypress/videos/`
- **Screenshots**: Enabled and stored in `cypress/screenshots/`

### Environment Variables

- `osint_url`: `http://localhost:8000`
- `mass_messenger_url`: `http://localhost:4444`
- `messenger_bot_url`: `http://localhost:3000`
- `failOnSnapshotDiff`: `false` (configurable)
- `updateSnapshots`: `false` (configurable)

## GitHub Actions Integration

The `.github/workflows/cypress-cross-browser.yml` workflow provides:

1. **Cross-Browser Matrix Testing**: Tests across Chrome, Firefox, and Edge
2. **Viewport Matrix Testing**: Tests desktop and mobile viewports
3. **Parallel Execution**: Runs different test buckets in parallel
4. **Artifact Storage**: Automatically uploads screenshots, videos, and snapshots

### Workflow Jobs

- **cypress-run**: Matrix testing across browsers and viewports
- **parallel-test**: Parallel execution of test buckets
- **visual-regression**: Dedicated visual regression testing

## Visual Regression Testing

### Setup

1. Install dependencies: `npm install`
2. Run tests to generate baseline snapshots
3. Subsequent runs compare against baselines

### Updating Snapshots

```bash
# Update all snapshots
npx cypress run --env updateSnapshots=true

# Update specific test snapshots
npx cypress run --spec "cypress/e2e/visual-regression/**/*.cy.js" --env updateSnapshots=true
```

### Snapshot Configuration

- **Failure Threshold**: 3% pixel difference
- **Threshold Type**: Percentage
- **Capture**: Viewport
- **Custom Directories**: `cypress/snapshots/` and `cypress/snapshots/diffs/`

## Mobile Responsiveness Testing

### Supported Devices

- **iPhone 6**: 375px × 667px
- **iPad 2**: 768px × 1024px
- **Desktop**: 1280px × 720px

### Test Strategy

1. **Layout Testing**: Verify elements render correctly
2. **Visual Snapshots**: Compare across devices
3. **Usability Testing**: Ensure functionality works on mobile
4. **Performance Testing**: Verify acceptable load times

## Troubleshooting

### Common Issues

1. **Service Not Available**
   - Ensure services are running: `npm run start-services`
   - Check health endpoints: `npm run health-check`

2. **Visual Regression Failures**
   - Review diff images in `cypress/snapshots/diffs/`
   - Update snapshots if changes are intentional
   - Check browser and OS consistency

3. **Mobile Tests Failing**
   - Verify viewport settings
   - Check responsive CSS
   - Ensure touch interactions work

### Debug Commands

```bash
# Run with debug output
DEBUG=cypress:* npm run test-e2e

# Run specific test file
npx cypress run --spec "cypress/e2e/health-checks/api-health.cy.js"

# Run in headed mode
npx cypress run --headed

# Run with specific browser
npx cypress run --browser chrome
```

## Contributing

When adding new tests:

1. Place tests in appropriate buckets for parallelization
2. Include visual regression tests for UI changes
3. Add mobile viewport tests for responsive features
4. Update this README with new features or commands
5. Ensure tests work across all supported browsers

## Dependencies

- `cypress`: ^13.6.0
- `cypress-image-snapshot`: ^4.0.1
- `concurrently`: ^8.2.2
- `wait-on`: ^7.2.0
- `axios`: ^1.6.2
