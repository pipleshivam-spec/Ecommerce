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

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $result = pg_query_params($conn, "SELECT * FROM products WHERE id = $1", [$id]);
        
        if ($result && pg_num_rows($result) > 0) {
            $product = pg_fetch_assoc($result);
            
            $imgResult = pg_query_params($conn, "SELECT image_url FROM product_images WHERE product_id = $1", [$id]);
            $images = [];
            while ($img = pg_fetch_assoc($imgResult)) {
                $images[] = $img['image_url'];
            }
            $product['images'] = $images;
            
            echo json_encode(['success' => true, 'product' => $product]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Product not found']);
        }
    } else {
        $result = pg_query($conn, "SELECT * FROM products ORDER BY created_at DESC");
        $products = [];
        while ($row = pg_fetch_assoc($result)) {
            $products[] = $row;
        }
        echo json_encode(['success' => true, 'products' => $products]);
    }
}

elseif ($method === 'POST') {
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $description = $data['description'] ?? '';
    $price = $data['price'] ?? 0;
    $category = $data['category'] ?? '';
    $image = $data['image'] ?? '';
    $stock = $data['stock'] ?? 0;
    
    $result = pg_query_params($conn, "INSERT INTO products (name, description, price, category, image, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [$name, $description, $price, $category, $image, $stock]);
    
    if ($result) {
        $row = pg_fetch_assoc($result);
        echo json_encode(['success' => true, 'message' => 'Product created', 'id' => $row['id']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create product']);
    }
}

elseif ($method === 'PUT') {
    requireAdmin();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    $name = $data['name'] ?? '';
    $price = $data['price'] ?? 0;
    $stock = $data['stock'] ?? 0;
    
    $result = pg_query_params($conn, "UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4", [$name, $price, $stock, $id]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Product updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update product']);
    }
}

elseif ($method === 'DELETE') {
    requireAdmin();
    
    $id = $_GET['id'] ?? 0;
    $result = pg_query_params($conn, "DELETE FROM products WHERE id = $1", [$id]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Product deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete product']);
    }
}
?>
