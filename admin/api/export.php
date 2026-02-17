<?php
/**
 * API: Export endpoint
 * GET ?type=uploads|logs|backup
 */
require_once __DIR__ . '/../helpers.php';
session_start();

if (!isset($_SESSION['admin'])) {
    json_response(['error' => 'Não autenticado'], 401);
}

$type = $_GET['type'] ?? 'uploads';
$timestamp = date('Ymd_His');

// ===== UTF-8 BOM for Excel =====
function csv_output($filename, $headers, $rows)
{
    header('Content-Type: text/csv; charset=utf-8');
    header("Content-Disposition: attachment; filename=\"{$filename}\"");

    // BOM for Excel BR
    echo "\xEF\xBB\xBF";

    $fp = fopen('php://output', 'w');
    fputcsv($fp, $headers);
    foreach ($rows as $row) {
        fputcsv($fp, $row);
    }
    fclose($fp);
    exit;
}

// ===== UPLOADS CSV =====
if ($type === 'uploads') {
    $uploads = get_all_uploads();
    log_action('export', count($uploads) . ' uploads exportados', 'ok');

    csv_output(
        "uploads_{$timestamp}.csv",
        ['Arquivo', 'Tipo', 'Tamanho (KB)', 'Data', 'URL'],
        array_map(fn($u) => [
            $u['filename'],
            $u['type'],
            $u['size_kb'],
            $u['date'],
            $u['url']
        ], $uploads)
    );
}

// ===== LOGS CSV =====
if ($type === 'logs') {
    $logs = get_logs(500);
    log_action('export', count($logs) . ' logs exportados', 'ok');

    csv_output(
        "logs_{$timestamp}.csv",
        ['Data/Hora', 'Ação', 'Detalhe', 'IP', 'Status'],
        array_map(fn($l) => [
            $l['ts'],
            $l['action'],
            $l['detail'] ?? '',
            $l['ip'] ?? '',
            $l['status']
        ], $logs)
    );
}

// ===== BACKUP ZIP =====
if ($type === 'backup') {
    if (!class_exists('ZipArchive')) {
        json_response(['error' => 'ZipArchive não disponível'], 500);
    }

    $zipFile = sys_get_temp_dir() . "/admin_backup_{$timestamp}.zip";
    $zip = new ZipArchive();

    if ($zip->open($zipFile, ZipArchive::CREATE) !== true) {
        json_response(['error' => 'Falha ao criar ZIP'], 500);
    }

    // Add stats.json
    if (file_exists(STATS_FILE)) {
        $zip->addFile(STATS_FILE, 'stats.json');
    }

    // Add config.json (sanitized — remove password hash)
    $config = get_config();
    $config['auth']['password_hash'] = '[REDACTED]';
    $zip->addFromString('config.json', json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Add activity.log
    if (file_exists(ACTIVITY_LOG)) {
        $zip->addFile(ACTIVITY_LOG, 'activity.log');
    }

    // Add uploads CSV
    $uploads = get_all_uploads();
    $csvContent = "\xEF\xBB\xBFArquivo,Tipo,Tamanho (KB),Data,URL\n";
    foreach ($uploads as $u) {
        $csvContent .= "\"{$u['filename']}\",\"{$u['type']}\",{$u['size_kb']},\"{$u['date']}\",\"{$u['url']}\"\n";
    }
    $zip->addFromString('uploads.csv', $csvContent);

    // Add README
    $readme = "# Backup Admin — Rugemtugem Assinaturas\n";
    $readme .= "Data: " . date('d/m/Y H:i:s') . "\n";
    $readme .= "Total uploads: " . count($uploads) . "\n";
    $readme .= "Espaço usado: " . round(array_sum(array_column($uploads, 'size')) / 1048576, 2) . " MB\n";
    $zip->addFromString('README.txt', $readme);

    $zip->close();

    log_action('export', 'Backup ZIP gerado', 'ok');

    header('Content-Type: application/zip');
    header("Content-Disposition: attachment; filename=\"admin_backup_{$timestamp}.zip\"");
    header('Content-Length: ' . filesize($zipFile));
    readfile($zipFile);
    unlink($zipFile);
    exit;
}

json_response(['error' => 'Tipo de export inválido'], 400);
