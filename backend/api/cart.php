<?php
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
require_once '../includes/auth.php';

requireLogin();
$userId = getUserId();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch cart items
if ($method === 'GET') {
    $stmt = $conn->prepare("
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image 
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    
    echo json_encode(['success' => true, 'items' => $items]);
}

// POST - Add to cart
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $productId = $data['product_id'] ?? 0;
    $quantity = $data['quantity'] ?? 1;
    
    // Check if already in cart
    $stmt = $conn->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt->bind_param("ii", $userId, $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update quantity
        $row = $result->fetch_assoc();
        $newQty = $row['quantity'] + $quantity;
        $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
        $stmt->bind_param("ii", $newQty, $row['id']);
        $stmt->execute();
    } else {
        // Insert new
        $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $userId, $productId, $quantity);
        $stmt->execute();
    }
    
    echo json_encode(['success' => true, 'message' => 'Added to cart']);
}

// DELETE - Remove from cart
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $conn->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $userId);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Removed from cart']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to remove']);
    }
}
?>
