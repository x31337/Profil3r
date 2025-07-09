<?php
// Basic PHP application for the profil3r-php service

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple router based on REQUEST_URI
$request_uri = $_SERVER['REQUEST_URI'];
$parsed_url = parse_url($request_uri);
$path = $parsed_url['path'] ?? '/';

// Set content type to JSON for API responses
header('Content-Type: application/json');

switch ($path) {
    case '/':
        echo json_encode([
            'message' => 'Hello from PHP!',
            'service' => 'profil3r-php',
            'version' => '1.0.0'
        ]);
        break;

    case '/health':
        echo json_encode([
            'status' => 'ok',
            'service' => 'profil3r-php',
            'timestamp' => date('c')
        ]);
        break;

    case '/info':
        echo json_encode([
            'php_version' => phpversion(),
            'service' => 'profil3r-php',
            'environment' => $_ENV['PHP_ENV'] ?? 'development'
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Not Found',
            'message' => 'The requested resource was not found'
        ]);
        break;
}
?>
