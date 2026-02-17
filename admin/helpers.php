<?php
/**
 * Admin Helpers — Funções utilitárias do painel administrativo
 * @version 2.0 — Command Center
 */

// ===== PATHS =====
define('ADMIN_DIR', __DIR__);
define('DATA_DIR', ADMIN_DIR . '/data/');
define('UPLOADS_DIR', realpath(ADMIN_DIR . '/../uploads') . '/');
define('CONFIG_FILE', DATA_DIR . 'config.json');
define('STATS_FILE', dirname(ADMIN_DIR) . '/stats.json');
define('ACTIVITY_LOG', DATA_DIR . 'activity.log');

// Garante que data/ existe
if (!is_dir(DATA_DIR))
    mkdir(DATA_DIR, 0755, true);

/**
 * Verifica autenticação. Se não autenticado, redireciona ou retorna 401.
 * @param bool $isApi — Se true, retorna JSON 401 ao invés de redirecionar
 */
function auth_check($isApi = false)
{
    session_start();
    if (!isset($_SESSION['admin'])) {
        if ($isApi) {
            json_response(['error' => 'Não autenticado'], 401);
        }
        header('Location: admin.php');
        exit;
    }
}

/**
 * Retorna configuração do sistema
 */
function get_config()
{
    if (!file_exists(CONFIG_FILE)) {
        $default = [
            'auth' => [
                'password_hash' => password_hash('SENHA_FORTE', PASSWORD_BCRYPT),
                'session_timeout_min' => 60
            ],
            'uploads' => [
                'max_size_mb' => 5,
                'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                'storage_path' => '../uploads/',
                'max_total_mb' => 500
            ],
            'system' => [
                'site_name' => 'Rugemtugem Assinaturas',
                'admin_email' => 'admin@rugemtugem.dev',
                'maintenance_mode' => false
            ]
        ];
        save_config($default);
        return $default;
    }
    return json_decode(file_get_contents(CONFIG_FILE), true);
}

/**
 * Salva configuração (com backup)
 */
function save_config($config)
{
    if (file_exists(CONFIG_FILE)) {
        copy(CONFIG_FILE, CONFIG_FILE . '.bak');
    }
    file_put_contents(CONFIG_FILE, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

/**
 * Registra ação no activity log (JSONL, rotação 500)
 */
function log_action($action, $detail = '', $status = 'ok')
{
    $entry = json_encode([
        'ts' => date('c'),
        'action' => $action,
        'user' => 'admin',
        'detail' => $detail,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
        'status' => $status
    ], JSON_UNESCAPED_UNICODE);

    // Append
    file_put_contents(ACTIVITY_LOG, $entry . "\n", FILE_APPEND);

    // Rotação: manter apenas 500 linhas
    if (file_exists(ACTIVITY_LOG)) {
        $lines = file(ACTIVITY_LOG, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (count($lines) > 500) {
            $lines = array_slice($lines, -500);
            file_put_contents(ACTIVITY_LOG, implode("\n", $lines) . "\n");
        }
    }
}

/**
 * Retorna todos os logs como array
 */
function get_logs($limit = 100)
{
    if (!file_exists(ACTIVITY_LOG))
        return [];
    $lines = file(ACTIVITY_LOG, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $logs = [];
    foreach (array_reverse($lines) as $line) {
        $entry = json_decode($line, true);
        if ($entry)
            $logs[] = $entry;
        if (count($logs) >= $limit)
            break;
    }
    return $logs;
}

/**
 * Resposta JSON padronizada
 */
function json_response($data, $code = 200)
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Deleção segura de arquivo (com validação de path traversal)
 */
function safe_delete($filename)
{
    $filename = basename($filename); // strip path
    $filePath = UPLOADS_DIR . $filename;
    $realPath = realpath($filePath);

    // Path traversal check
    if (!$realPath || strpos($realPath, realpath(UPLOADS_DIR)) !== 0) {
        return ['success' => false, 'error' => 'Caminho inválido'];
    }

    if (!file_exists($realPath)) {
        return ['success' => false, 'error' => 'Arquivo não encontrado'];
    }

    $size = filesize($realPath);
    if (unlink($realPath)) {
        log_action('delete', "$filename ({$size}b)", 'ok');
        return ['success' => true, 'file' => $filename, 'size' => $size];
    }
    return ['success' => false, 'error' => 'Falha ao deletar'];
}

/**
 * Lista todos os uploads com metadados
 */
function get_all_uploads()
{
    $uploads = [];
    $files = glob(UPLOADS_DIR . '*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
    if (!$files)
        return $uploads;

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $baseUrl = $protocol . '://' . $_SERVER['HTTP_HOST'] . '/sales-prime/assinatura/uploads/';

    foreach ($files as $file) {
        $name = basename($file);
        $size = filesize($file);
        $mtime = filemtime($file);
        $uploads[] = [
            'filename' => $name,
            'type' => detect_upload_type($name),
            'size' => $size,
            'size_kb' => round($size / 1024, 1),
            'date' => date('Y-m-d H:i:s', $mtime),
            'timestamp' => $mtime,
            'url' => $baseUrl . $name,
            'is_new' => (time() - $mtime) < 86400 // <24h
        ];
    }

    // Ordenar por data (mais recente primeiro)
    usort($uploads, fn($a, $b) => $b['timestamp'] - $a['timestamp']);
    return $uploads;
}

/**
 * Detecta tipo do upload pelo nome (heurística)
 */
function detect_upload_type($filename)
{
    // Check stats.json for type info
    if (file_exists(STATS_FILE)) {
        $stats = json_decode(file_get_contents(STATS_FILE), true);
        if (!empty($stats['recent'])) {
            foreach ($stats['recent'] as $r) {
                if ($r['file'] === $filename) {
                    return $r['type'] ?? 'foto';
                }
            }
        }
    }
    return 'foto'; // default
}

/**
 * Recalcula e grava stats.json a partir dos arquivos reais
 */
function update_stats()
{
    $uploads = get_all_uploads();
    $totalBytes = 0;
    $photos = 0;
    $logos = 0;
    $recent = [];

    foreach ($uploads as $u) {
        $totalBytes += $u['size'];
        if ($u['type'] === 'logo')
            $logos++;
        else
            $photos++;
    }

    // Manter recent do stats existente se disponível
    if (file_exists(STATS_FILE)) {
        $existing = json_decode(file_get_contents(STATS_FILE), true);
        $recent = $existing['recent'] ?? [];
    }

    $stats = [
        'total_uploads' => count($uploads),
        'photos' => $photos,
        'logos' => $logos,
        'total_bytes' => $totalBytes,
        'recent' => array_slice($recent, 0, 50)
    ];

    file_put_contents(STATS_FILE, json_encode($stats, JSON_PRETTY_PRINT));
    return $stats;
}

/**
 * Calcula uploads por dia nos últimos 7 dias
 */
function get_uploads_7d()
{
    $days = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-{$i} days"));
        $days[$date] = 0;
    }

    $files = glob(UPLOADS_DIR . '*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
    if ($files) {
        foreach ($files as $file) {
            $date = date('Y-m-d', filemtime($file));
            if (isset($days[$date])) {
                $days[$date]++;
            }
        }
    }

    return array_values($days);
}

/**
 * Informações de saúde do sistema
 */
function get_system_status()
{
    return [
        'uploads_writable' => is_writable(UPLOADS_DIR),
        'php_version' => phpversion(),
        'free_mb' => round(disk_free_space(UPLOADS_DIR) / (1024 * 1024), 1),
        'max_upload_mb' => min(
            (int) ini_get('upload_max_filesize'),
            (int) ini_get('post_max_size')
        ),
        'stats_updated' => file_exists(STATS_FILE) ? date('c', filemtime(STATS_FILE)) : null
    ];
}

/**
 * Formata bytes para leitura humana
 */
function format_bytes($bytes)
{
    if ($bytes >= 1048576)
        return round($bytes / 1048576, 1) . ' MB';
    if ($bytes >= 1024)
        return round($bytes / 1024, 1) . ' KB';
    return $bytes . ' B';
}
