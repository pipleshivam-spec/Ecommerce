<?php
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
require_once '../includes/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch products
if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $product = $result->fetch_assoc();
            
            // Get images
            $imgStmt = $conn->prepare("SELECT image_url FROM product_images WHERE product_id = ?");
            $imgStmt->bind_param("i", $id);
            $imgStmt->execute();
            $imgResult = $imgStmt->get_result();
            $images = [];
            while ($img = $imgResult->fetch_assoc()) {
                $images[] = $img['image_url'];
            }
            $product['images'] = $images;
            
            echo json_encode(['success' => true, 'product' => $product]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Product not found']);
        }
    } else {
        $result = $conn->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        echo json_encode(['success' => true, 'products' => $products]);
    }
}

// POST - Create product (Admin only)
elseif ($method === 'POST') {
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $description = $data['description'] ?? '';
    $price = $data['price'] ?? 0;
    $category = $data['category'] ?? '';
    $image = $data['image'] ?? '';
    $stock = $data['stock'] ?? 0;
    
    $stmt = $conn->prepare("INSERT INTO products (name, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdssi", $name, $description, $price, $category, $image, $stock);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product created', 'id' => $conn->insert_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create product']);
    }
}

// PUT - Update product (Admin only)
elseif ($method === 'PUT') {
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    $name = $data['name'] ?? '';
    $price = $data['price'] ?? 0;
    $stock = $data['stock'] ?? 0;
    
    $stmt = $conn->prepare("UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?");
    $stmt->bind_param("sdii", $name, $price, $stock, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update product']);
    }
}

// DELETE - Delete product (Admin only)
elseif ($method === 'DELETE') {
    requireAdmin();
    
    $id = $_GET['id'] ?? 0;
    $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete product']);
    }
}
?>
