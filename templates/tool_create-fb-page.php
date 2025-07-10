<?php $this->layout('layout', ['title' => 'Create Facebook Page']) ?>

<div class="bg-light p-4 rounded">
    <h1>Create Facebook Page</h1>
    <p>This tool attempts to create a new Facebook Page.</p>

    <form method="POST" action="/tool/create-fb-page">
        <div class="mb-3">
            <label for="token" class="form-label">Access Token</label>
            <input type="text" class="form-control" id="token" name="token" required value="<?= $this->e($token ?? '') ?>">
            <div class="form-text">The access token of the main profile with page creation permissions.</div>
        </div>
        <div class="mb-3">
            <label for="full_name" class="form-label">Page Full Name</label>
            <input type="text" class="form-control" id="full_name" name="full_name" required value="<?= $this->e($full_name ?? '') ?>">
        </div>
        <button type="submit" class="btn btn-primary">Create Page</button>
    </form>

    <?php if (isset($result)): ?>
        <div class="mt-4">
            <h3>Result:</h3>
            <div class="result-box">
                <?= $this->e($result) ?>
            </div>
        </div>
    <?php endif; ?>
    <?php if (isset($error)): ?>
        <div class="mt-4">
            <h3>Error:</h3>
            <div class="alert alert-danger" role="alert">
                <?= $this->e($error) ?>
            </div>
        </div>
    <?php endif; ?>
</div>
