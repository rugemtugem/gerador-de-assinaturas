<?php
/**
 * SISTEMA DE UPLOAD DE IMAGENS PARA GERADOR DE ASSINATURA
 * 
 * Este script PHP processa uploads de imagens (foto do colaborador e logo da empresa)
 * para o sistema de geração de assinaturas de email da Rugemtugem.
 * 
 * Funcionalidades:
 * - Upload seguro de imagens
 * - Validação de tipos de arquivo
 * - Geração de nomes únicos para evitar conflitos
 * - Retorno de URLs públicas das imagens
 * 
 * Segurança implementada:
 * - Validação de extensões de arquivo
 * - Verificação de existência de arquivo
 * - Geração de nomes únicos com uniqid()
 * - Limitação de tipos MIME aceitos
 * 
 * @author Rugemtugem
 * @version 2.0
 */

// ===== CONFIGURAÇÃO DE HEADERS =====
header('Content-Type: application/json');

// ===== CONFIGURAÇÃO DE DIRETÓRIOS =====
$uploadDir = __DIR__ . '/uploads/';

// URL dinâmica baseada no servidor
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$baseUrl = $protocol . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . '/uploads/';

// ===== VERIFICAÇÃO E CRIAÇÃO DO DIRETÓRIO =====
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// ===== VALIDAÇÃO DE ARQUIVO ENVIADO =====
if (!isset($_FILES['image'])) {
    echo json_encode(['error' => 'Nenhum arquivo enviado']);
    exit;
}

// ===== PROCESSAMENTO DO ARQUIVO =====
$f = $_FILES['image'];
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));

// ===== VALIDAÇÃO DE TIPO DE ARQUIVO =====
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

if (!in_array($ext, $allowed)) {
    echo json_encode(['error' => 'Formato de arquivo inválido. Use JPG, WEBP, PNG ou GIF.']);
    exit;
}

// ===== GERAÇÃO DE NOME ÚNICO =====
$new = uniqid() . '.' . $ext;

// ===== DEFINIÇÃO DO CAMINHO FINAL =====
$to = $uploadDir . $new;

// ===== MOVIMENTAÇÃO DO ARQUIVO =====
if (move_uploaded_file($f['tmp_name'], $to)) {
    // ===== TRACKING DE STATS =====
    $statsFile = __DIR__ . '/stats.json';
    $stats = file_exists($statsFile) ? json_decode(file_get_contents($statsFile), true) : [
        'total_uploads' => 0,
        'photos' => 0,
        'logos' => 0,
        'total_bytes' => 0,
        'recent' => []
    ];

    $stats['total_uploads']++;
    $stats['total_bytes'] += $f['size'];

    // Tipo: 'photo' ou 'logo' (enviado pelo frontend)
    $type = isset($_POST['type']) ? $_POST['type'] : 'photo';
    if ($type === 'logo') {
        $stats['logos']++;
    } else {
        $stats['photos']++;
    }

    // Log dos últimos 50 uploads
    array_unshift($stats['recent'], [
        'file' => $new,
        'type' => $type,
        'size' => $f['size'],
        'date' => date('Y-m-d H:i:s')
    ]);
    $stats['recent'] = array_slice($stats['recent'], 0, 50);

    file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'url' => $baseUrl . $new,
        'filename' => $new,
        'message' => 'Upload realizado com sucesso'
    ]);
} else {
    echo json_encode([
        'error' => 'Falha no upload. Verifique as permissões do diretório.',
        'debug_info' => [
            'upload_dir' => $uploadDir,
            'target_file' => $to,
            'temp_file' => $f['tmp_name'],
            'file_size' => $f['size'],
            'error_code' => $f['error']
        ]
    ]);
}

/**
 * CÓDIGOS DE ERRO DO PHP PARA UPLOAD:
 * UPLOAD_ERR_OK (0): Upload realizado com sucesso
 * UPLOAD_ERR_INI_SIZE (1): Arquivo excede upload_max_filesize do php.ini
 * UPLOAD_ERR_FORM_SIZE (2): Arquivo excede MAX_FILE_SIZE do formulário HTML
 * UPLOAD_ERR_PARTIAL (3): Upload foi feito parcialmente
 * UPLOAD_ERR_NO_FILE (4): Nenhum arquivo foi enviado
 * UPLOAD_ERR_NO_TMP_DIR (6): Pasta temporária não encontrada
 * UPLOAD_ERR_CANT_WRITE (7): Falha ao escrever arquivo no disco
 * UPLOAD_ERR_EXTENSION (8): Upload interrompido por extensão PHP
 */
?>