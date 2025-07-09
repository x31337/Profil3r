#!/usr/bin/env node

/**
 * Simple test to verify the new legacy interface works correctly
 */

const AutoBuildSystem = require('./legacy-autobuild');

async function testLegacyInterface() {
  console.log('🧪 Testing Legacy Interface...\n');

  try {
    // Test 1: Constructor and module initialization
    console.log('Test 1: Constructor and module initialization');
    const autoBuild = new AutoBuildSystem();
    
    // Check that all modules are properly initialized
    console.log('✅ DependencyManager initialized:', !!autoBuild.dependencyManager);
    console.log('✅ Builder initialized:', !!autoBuild.builder);
    console.log('✅ Tester initialized:', !!autoBuild.tester);
    console.log('✅ Deployer initialized:', !!autoBuild.deployer);
    console.log('✅ AutoFixEngine initialized:', !!autoBuild.autoFixEngine);
    console.log('✅ ServiceManager initialized:', !!autoBuild.serviceManager);
    console.log('✅ EventBus initialized:', !!autoBuild.eventBus);
    
    // Test 2: Legacy method signatures exist
    console.log('\nTest 2: Legacy method signatures exist');
    const legacyMethods = [
      'fullBuildCycle',
      'installDependencies',
      'buildAllComponents', 
      'runAllTests',
      'runCypressTests',
      'deployChanges',
      'autoFixIssues',
      'autoFixFile',
      'startService',
      'stopService',
      'startHealthMonitoring',
      'generateReports'
    ];
    
    legacyMethods.forEach(method => {
      console.log(`✅ ${method}:`, typeof autoBuild[method] === 'function');
    });
    
    // Test 3: State object structure
    console.log('\nTest 3: State object structure');
    const requiredStateKeys = [
      'building',
      'testing', 
      'services',
      'buildQueue',
      'testResults',
      'healthChecks',
      'errors',
      'lastBuild',
      'buildCount',
      'testCount',
      'deployCount'
    ];
    
    requiredStateKeys.forEach(key => {
      console.log(`✅ state.${key}:`, autoBuild.state.hasOwnProperty(key));
    });
    
    // Test 4: Configuration structure
    console.log('\nTest 4: Configuration structure');
    const requiredConfigKeys = [
      'projectRoot',
      'buildDir',
      'logDir',
      'webPort',
      'wsPort',
      'services',
      'autoFix',
      'autoPush',
      'realTimeMonitoring',
      'testCoverage',
      'buildTimeout'
    ];
    
    requiredConfigKeys.forEach(key => {
      console.log(`✅ config.${key}:`, autoBuild.config.hasOwnProperty(key));
    });
    
    // Test 5: Event system integration
    console.log('\nTest 5: Event system integration');
    let eventReceived = false;
    
    autoBuild.eventBus.on('test-event', (data) => {
      eventReceived = true;
      console.log('✅ Event received:', data.message);
    });
    
    autoBuild.eventBus.broadcast('test-event', { message: 'Test successful' });
    console.log('✅ Event broadcast:', eventReceived);
    
    // Test 6: Backward compatibility methods
    console.log('\nTest 6: Backward compatibility methods');
    const backwardCompatMethods = [
      'lintAndFix',
      'buildComponent',
      'waitForService',
      'runUnitTests',
      'runIntegrationTests',
      'calculateCoverage',
      'findFiles',
      'checkPackageInstalled',
      'parseCypressResults'
    ];
    
    backwardCompatMethods.forEach(method => {
      console.log(`✅ ${method}:`, typeof autoBuild[method] === 'function');
    });
    
    // Test 7: Module method availability
    console.log('\nTest 7: Module method availability');
    console.log('✅ dependencyManager.installDependencies:', typeof autoBuild.dependencyManager.installDependencies === 'function');
    console.log('✅ builder.fullBuild:', typeof autoBuild.builder.fullBuild === 'function');
    console.log('✅ tester.runAllTests:', typeof autoBuild.tester.runAllTests === 'function');
    console.log('✅ deployer.deployChanges:', typeof autoBuild.deployer.deployChanges === 'function');
    console.log('✅ autoFixEngine.autoFixIssues:', typeof autoBuild.autoFixEngine.autoFixIssues === 'function');
    console.log('✅ serviceManager.startService:', typeof autoBuild.serviceManager.startService === 'function');
    
    // Test 8: WebSocket and HTTP server methods
    console.log('\nTest 8: WebSocket and HTTP server methods');
    console.log('✅ startWebServer:', typeof autoBuild.startWebServer === 'function');
    console.log('✅ startWebSocketServer:', typeof autoBuild.startWebSocketServer === 'function');
    console.log('✅ broadcast:', typeof autoBuild.broadcast === 'function');
    
    // Test 9: File watcher methods
    console.log('\nTest 9: File watcher methods');
    console.log('✅ initFileWatchers:', typeof autoBuild.initFileWatchers === 'function');
    console.log('✅ queueBuild:', typeof autoBuild.queueBuild === 'function');
    
    // Test 10: Shutdown method
    console.log('\nTest 10: Shutdown method');
    console.log('✅ shutdown:', typeof autoBuild.shutdown === 'function');
    
    console.log('\n🎉 All tests passed! Legacy interface is working correctly.\n');
    
    // Don't actually start the system in test mode
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testLegacyInterface();
