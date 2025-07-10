<?php $this->layout('layout', ['title' => 'Available Tools']) ?>

<div class="bg-light p-5 rounded">
    <h1>Available Facebook Tools</h1>
    <p class="lead">Select a tool from the list below to get started.</p>

    <?php if (empty($tools)): ?>
        <p>No tools available at the moment. Please check back later.</p>
    <?php else: ?>
        <ul class="list-group">
            <?php foreach ($tools as $tool): ?>
                <li class="list-group-item">
                    <?php
                        // We currently only have routes for 'check-fb-acc' and 'create-fb-page'.
                        // For others, we'll link to a generic placeholder page or disable the link.
                        $toolUrl = '/tool/' . $this->e($tool['slug']);
                        // A simple check to see if we have a specific handler for this tool slug
                        // This is a basic way to handle it; a more robust app would register routes dynamically or check route existence.
                        $supportedSlugs = ['check-fb-acc', 'create-fb-page'];
                        if (in_array($tool['slug'], $supportedSlugs)):
                    ?>
                        <a href="<?= $this->e($toolUrl) ?>"><?= $this->e($tool['name']) ?></a>
                    <?php else: ?>
                        <?= $this->e($tool['name']) ?> (Coming Soon)
                    <?php endif; ?>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</div>
