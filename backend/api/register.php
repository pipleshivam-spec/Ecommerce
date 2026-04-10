<?php
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$phone = $data['phone'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Name, email and password required']);
    exit;
}

$result = pg_query_params($conn, "SELECT id FROM users WHERE email = $1", [$email]);
if (pg_num_rows($result) > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$result = pg_query_params($conn, "INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4)", [$name, $email, $hashedPassword, $phone]);

if ($result) {
    echo json_encode(['success' => true, 'message' => 'Registration successful']);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed']);
}
?>
