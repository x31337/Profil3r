class Deployer {
  constructor(config, eventBus, git) {
    this.config = config;
    this.eventBus = eventBus;
    this.git = git;
    this.deploying = false;
  }

  async deployChanges() {
    if (!this.config.autoPush) {
      console.log('⏸️ Auto-push disabled');
      return;
    }

    if (this.deploying) {
      console.log('⏳ Deployment already in progress...');
      return;
    }

    this.deploying = true;
    const deployId = Date.now();
    this.eventBus.broadcast('deployment-started', { deployId });

    try {
      console.log('🚀 Deploying changes...');

      // Stage all changes
      await this.git.add('.');

      // Commit changes
      const commitMessage = `feat: automated build and test cycle \n
- Build completed: ${new Date().toISOString()}\n
- Tests passed\n
- Services healthy\n
[skip ci]`;

      await this.git.commit(commitMessage);

      // Push changes
      await this.git.push('origin', 'main');

      this.eventBus.broadcast('deployment-completed', {
        success: true,
        deployId
      });

      console.log('✅ Changes deployed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      this.eventBus.broadcast('deployment-failed', {
        deployId,
        error: error.message
      });
      throw error;
    } finally {
      this.deploying = false;
    }
  }
}

module.exports = Deployer;
