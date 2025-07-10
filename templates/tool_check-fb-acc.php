<?php $this->layout('layout', ['title' => 'Check Facebook Account Status']) ?>

<div class="bg-light p-4 rounded">
    <h1>Check Facebook Account Status</h1>
    <p>This tool checks if a Facebook profile User ID is live or not.</p>

    <form method="POST" action="/tool/check-fb-acc">
        <div class="mb-3">
            <label for="uid" class="form-label">Facebook User ID</label>
            <input type="text" class="form-control" id="uid" name="uid" required value="<?= $this->e($uid ?? '') ?>">
        </div>
        <button type="submit" class="btn btn-primary">Check Status</button>
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
