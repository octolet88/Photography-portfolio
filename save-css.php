<?php
// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the JSON data from the request
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Check if the required data is present
    if (isset($data['css']) && isset($data['path'])) {
        $css_content = $data['css'];
        $file_path = $data['path'];

        // Validate the file path to ensure it's a CSS file in the current directory
        if (pathinfo($file_path, PATHINFO_EXTENSION) === 'css') {
            // Write the CSS content to the file
            $result = file_put_contents($file_path, $css_content);

            if ($result !== false) {
                // Success
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'CSS file updated successfully']);
                exit;
            } else {
                // Error writing to file
                header('Content-Type: application/json');
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error writing to CSS file']);
                exit;
            }
        } else {
            // Invalid file path
            header('Content-Type: application/json');
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid file path']);
            exit;
        }
    } else {
        // Missing required data
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required data']);
        exit;
    }
} else {
    // Not a POST request
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}
?>
