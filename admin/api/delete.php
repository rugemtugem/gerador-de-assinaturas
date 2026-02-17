<?php
/**
 * API: Delete endpoint
 * POST {files: ["file1.jpg", "file2.png"]}
 */
require_once __DIR__ . '/../helpers.php';
session_start();

if (!isset($_SESSION['admin'])) {
    json_response(['error' => 'Não autenticado'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Método não permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$files = $input['files'] ?? [];

if (empty($files) || !is_array($files)) {
    json_response(['error' => 'Nenhum arquivo especificado'], 400);
}

$deleted = [];
$errors = [];

foreach ($files as $filename) {
    $result = safe_delete($filename);
    if ($result['success']) {
        $deleted[] = $filename;
    } else {
        $errors[] = ['file' => $filename, 'error' => $result['error']];
    }
}

// Recalculate stats after deletion
update_stats();

json_response([
    'deleted' => $deleted,
    'errors' => $errors,
    'total_deleted' => count($deleted)
]);
