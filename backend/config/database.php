<?php
// PostgreSQL Database Configuration
define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_USER', 'postgres');
define('DB_PASS', 'Yash@#$2018');
define('DB_NAME', 'ecommerce');

$conn = pg_connect("host=" . DB_HOST . " port=" . DB_PORT . " dbname=" . DB_NAME . " user=" . DB_USER . " password=" . DB_PASS);

if (!$conn) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}
?>
