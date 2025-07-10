<?php

use DI\Container;
use Slim\Factory\AppFactory;
use Slim\Views\PhpRenderer;
use League\Plates\Engine;
use Slim\Views\PlatesRenderer;


require __DIR__ . '/../vendor/autoload.php';

// Instantiate PHP-DI Container
$container = new Container();

// Set container to create App with on AppFactory
AppFactory::setContainer($container);
$app = AppFactory::create();

// --- Helper function to discover tools ---
function getAvailableTools(string $scriptsPath): array
{
    $tools = [];
    $files = glob($scriptsPath . '/*.php');
    $excludedFiles = ['test.php']; // Add any other files to exclude, like library files

    foreach ($files as $file) {
        $filename = basename($file, '.php');
        if (in_array(basename($file), $excludedFiles)) {
            continue;
        }

        // Create a slug (e.g., check-fb-acc -> check-fb-acc)
        $slug = str_replace('_', '-', $filename);
        $slug = strtolower($slug);

        // Create a friendly name (e.g., check-fb-acc -> Check Fb Acc)
        $friendlyName = str_replace(['-', '_'], ' ', $filename);
        $friendlyName = ucwords($friendlyName);
        // Specific overrides for better names
        if ($slug === 'check-fb-acc') $friendlyName = 'Check Facebook Account Status';
        if ($slug === 'create-fb-page') $friendlyName = 'Create Facebook Page';
        // Add more overrides as needed for other scripts

        $tools[] = [
            'slug' => $slug,
            'name' => $friendlyName,
            'original_script' => $filename . '.php' // Keep original filename if needed later
        ];
    }
    // Sort tools by name for consistent display
    usort($tools, fn($a, $b) => strcmp($a['name'], $b['name']));
    return $tools;
}

// Add Routing Middleware
$app->addRoutingMiddleware();

// Add Error Handling Middleware
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// --- Template Engine Setup (Plates) ---
$container->set('view', function () {
    return new PlatesRenderer(new Engine(__DIR__ . '/../templates'));
});


// --- Routes ---
$app->get('/', function ($request, $response, $args) {
    $toolsPath = __DIR__ . '/../tools/php_tools/facebook_scripts';
    $availableTools = getAvailableTools($toolsPath);
    // Render a template using the 'view' service from the container
    return $this->get('view')->render($response, 'home.php', ['tools' => $availableTools]);
});

// --- Tool: Check Facebook Account ---
$app->get('/tool/check-fb-acc', function ($request, $response, $args) {
    return $this->get('view')->render($response, 'tool_check-fb-acc.php');
});

$app->post('/tool/check-fb-acc', function ($request, $response, $args) {
    $params = (array)$request->getParsedBody();
    $uid = $params['uid'] ?? '';
    $result = '';
    $error = '';

    if (empty($uid)) {
        $error = "User ID cannot be empty.";
    } else {
        try {
            $checker = new \App\FacebookTools\AccountChecker();
            $result = $checker->checkAccount($uid);
        } catch (\Exception $e) {
            $error = "An application error occurred: " . $e->getMessage();
        }
    }

    return $this->get('view')->render($response, 'tool_check-fb-acc.php', [
        'uid' => $uid,
        'result' => $result,
        'error' => $error
    ]);
});

// --- Tool: Create Facebook Page ---
$app->get('/tool/create-fb-page', function ($request, $response, $args) {
    return $this->get('view')->render($response, 'tool_create-fb-page.php');
});

$app->post('/tool/create-fb-page', function ($request, $response, $args) {
    $params = (array)$request->getParsedBody();
    $token = $params['token'] ?? '';
    $full_name = $params['full_name'] ?? '';
    $result = '';
    $error = '';

    if (empty($token) || empty($full_name)) {
        $error = "Access Token and Page Full Name cannot be empty.";
    } else {
        try {
            $creator = new \App\FacebookTools\PageCreator();
            $result = $creator->createPage($token, $full_name);
        } catch (\Exception $e) {
            $error = "An application error occurred: " . $e->getMessage();
        }
    }

    return $this->get('view')->render($response, 'tool_create-fb-page.php', [
        'token' => $token,
        'full_name' => $full_name,
        'result' => $result,
        'error' => $error
    ]);
});


// Health check (good to keep)
$app->get('/health', function ($request, $response, $args) {
    $payload = json_encode(['status' => 'ok', 'service' => 'php-tools-web', 'port' => 8080]);
    $response->getBody()->write($payload);
    return $response->withHeader('Content-Type', 'application/json');
});


$app->run();
