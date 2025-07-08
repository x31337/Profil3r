<?php
$port = 80;
$host = "0.0.0.0";

// Handle health check first (before any output)
if (isset($_SERVER["REQUEST_URI"]) && $_SERVER["REQUEST_URI"] === "/health") {
    header("Content-Type: application/json");
    echo json_encode(["status" => "ok", "service" => "php-tools", "port" => $port]);
    exit;
}

// Output startup message for non-health requests
echo "PHP Tools server starting on $host:$port\n";
echo "<br>";
echo "Available endpoints:<br>";
echo "- /health (health check)<br>";
echo "- / (service info)<br>";
echo "<br>";

// Handle root request
if (isset($_SERVER["REQUEST_URI"]) && $_SERVER["REQUEST_URI"] === "/") {
    echo "PHP Tools Service - Available scripts: check-fb-acc.php, get-all-pages.php, etc.";
    exit;
}

// Default response
echo "PHP Tools Service";
?>
