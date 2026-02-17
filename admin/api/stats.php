<?php
/**
 * API: Stats & Actions endpoint
 * GET  → retorna métricas, uploads, health, logs
 * POST → ações (clear_logs, reset_stats, clear_uploads, save_settings)
 */
require_once __DIR__ . '/../helpers.php';
session_start();

// Auth check
if (!isset($_SESSION['admin'])) {
    json_response(['error' => 'Não autenticado'], 401);
}

// ===== GET: Retornar dados =====
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $config = get_config();
    $uploads = get_all_uploads();
    $totalBytes = array_sum(array_column($uploads, 'size'));
    $photos = count(array_filter($uploads, fn($u) => $u['type'] !== 'logo'));
    $logos = count(array_filter($uploads, fn($u) => $u['type'] === 'logo'));

    $response = [
        'total_uploads' => count($uploads),
        'fotos' => $photos,
        'logos' => $logos,
        'disk_used_mb' => round($totalBytes / (1024 * 1024), 2),
        'disk_limit_mb' => $config['uploads']['max_total_mb'] ?? 500,
        'uploads_7d' => get_uploads_7d(),
        'recent_uploads' => array_slice($uploads, 0, 10),
        'system_status' => get_system_status()
    ];

    // Full uploads list
    if (isset($_GET['full'])) {
        $response['all_uploads'] = $uploads;
    }

    // Logs
    if (isset($_GET['logs'])) {
        $response['logs'] = get_logs(200);
    }

    json_response($response);
}

// ===== POST: Ações =====
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    switch ($action) {
        case 'clear_logs':
            if (file_exists(ACTIVITY_LOG)) {
                file_put_contents(ACTIVITY_LOG, '');
            }
            log_action('config', 'Logs limpos', 'ok');
            json_response(['success' => true]);
            break;

        case 'reset_stats':
            if (file_exists(STATS_FILE)) {
                unlink(STATS_FILE);
            }
            update_stats();
            log_action('config', 'Stats resetados', 'ok');
            json_response(['success' => true]);
            break;

        case 'clear_uploads':
            $files = glob(UPLOADS_DIR . '*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
            $count = 0;
            if ($files) {
                foreach ($files as $file) {
                    if (unlink($file))
                        $count++;
                }
            }
            update_stats();
            log_action('delete', "Limpeza: $count arquivos removidos", 'ok');
            json_response(['success' => true, 'deleted_count' => $count]);
            break;

        case 'save_settings':
            $section = $input['section'] ?? '';
            $config = get_config();

            if ($section === 'security') {
                // Validate current password
                if (!empty($input['new_password'])) {
                    if (empty($input['current_password']) || !password_verify($input['current_password'], $config['auth']['password_hash'])) {
                        json_response(['error' => 'Senha atual incorreta'], 400);
                    }
                    if (strlen($input['new_password']) < 8) {
                        json_response(['error' => 'Nova senha deve ter no mínimo 8 caracteres'], 400);
                    }
                    if ($input['new_password'] !== ($input['confirm_password'] ?? '')) {
                        json_response(['error' => 'Senhas não coincidem'], 400);
                    }
                    $config['auth']['password_hash'] = password_hash($input['new_password'], PASSWORD_BCRYPT);
                }
                if (isset($input['session_timeout_min'])) {
                    $config['auth']['session_timeout_min'] = max(30, (int) $input['session_timeout_min']);
                }
            }

            if ($section === 'uploads') {
                if (isset($input['max_size_mb'])) {
                    $config['uploads']['max_size_mb'] = max(1, min(50, (int) $input['max_size_mb']));
                }
                if (isset($input['max_total_mb'])) {
                    $config['uploads']['max_total_mb'] = max(50, (int) $input['max_total_mb']);
                }
            }

            if ($section === 'system') {
                if (isset($input['site_name'])) {
                    $config['system']['site_name'] = trim($input['site_name']);
                }
                if (isset($input['admin_email'])) {
                    $config['system']['admin_email'] = trim($input['admin_email']);
                }
                $config['system']['maintenance_mode'] = !empty($input['maintenance_mode']);
            }

            save_config($config);
            log_action('config', "Settings '$section' atualizados", 'ok');
            json_response(['success' => true]);
            break;

        default:
            json_response(['error' => 'Ação desconhecida'], 400);
    }
}
