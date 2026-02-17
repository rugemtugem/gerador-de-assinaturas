<!-- ===== SETTINGS SECTION ===== -->
<?php
$config = get_config();
?>

<!-- Security -->
<div class="settings-card">
    <div class="settings-header">
        <h6><i class="bi bi-shield-lock" style="color:var(--secondary);"></i> Segurança</h6>
    </div>
    <div class="settings-body">
        <form id="settingsForm-security" onsubmit="event.preventDefault();Admin.saveSettings('security');">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                <div>
                    <label class="form-label">Senha Atual</label>
                    <input type="password" name="current_password" class="form-control" placeholder="••••••••">
                </div>
                <div>
                    <label class="form-label">Nova Senha</label>
                    <input type="password" name="new_password" class="form-control" placeholder="Min. 8 caracteres">
                </div>
                <div>
                    <label class="form-label">Confirmar Nova Senha</label>
                    <input type="password" name="confirm_password" class="form-control" placeholder="••••••••">
                </div>
            </div>
            <div style="margin-top:1rem;">
                <label class="form-label">Timeout de Sessão</label>
                <select name="session_timeout_min" class="form-select" style="max-width:200px;">
                    <option value="30" <?= ($config['auth']['session_timeout_min'] ?? 60) == 30 ? 'selected' : '' ?>>30
                        minutos</option>
                    <option value="60" <?= ($config['auth']['session_timeout_min'] ?? 60) == 60 ? 'selected' : '' ?>>1 hora
                    </option>
                    <option value="120" <?= ($config['auth']['session_timeout_min'] ?? 60) == 120 ? 'selected' : '' ?>>2
                        horas</option>
                    <option value="0" <?= ($config['auth']['session_timeout_min'] ?? 60) == 0 ? 'selected' : '' ?>>Sem
                        limite</option>
                </select>
            </div>
            <div style="margin-top:1rem;">
                <button type="submit" class="btn-admin primary"><i class="bi bi-check-lg"></i> Salvar Segurança</button>
            </div>
        </form>
    </div>
</div>

<!-- Uploads Config -->
<div class="settings-card">
    <div class="settings-header">
        <h6><i class="bi bi-cloud-arrow-up" style="color:var(--secondary);"></i> Uploads</h6>
    </div>
    <div class="settings-body">
        <form id="settingsForm-uploads" onsubmit="event.preventDefault();Admin.saveSettings('uploads');">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div>
                    <label class="form-label">Tamanho Máximo por Arquivo (MB)</label>
                    <input type="number" name="max_size_mb" class="form-control" min="1" max="50"
                        value="<?= $config['uploads']['max_size_mb'] ?? 5 ?>" style="max-width:150px;">
                </div>
                <div>
                    <label class="form-label">Limite Total de Disco (MB)</label>
                    <input type="number" name="max_total_mb" class="form-control" min="50"
                        value="<?= $config['uploads']['max_total_mb'] ?? 500 ?>" style="max-width:150px;">
                </div>
            </div>
            <div style="margin-top:1rem;">
                <label class="form-label">Extensões Permitidas</label>
                <div style="display:flex;gap:1rem;flex-wrap:wrap;">
                    <?php
                    $allowed = $config['uploads']['allowed_extensions'] ?? ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                    foreach (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] as $ext):
                        ?>
                        <label
                            style="display:flex;align-items:center;gap:6px;color:var(--text-secondary);font-size:0.85rem;cursor:pointer;">
                            <input type="checkbox" class="admin-check" name="ext_<?= $ext ?>" <?= in_array($ext, $allowed) ? 'checked' : '' ?>>
                            .
                            <?= $ext ?>
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>
            <div style="margin-top:1rem;">
                <button type="submit" class="btn-admin primary"><i class="bi bi-check-lg"></i> Salvar Uploads</button>
            </div>
        </form>
    </div>
</div>

<!-- System -->
<div class="settings-card">
    <div class="settings-header">
        <h6><i class="bi bi-gear" style="color:var(--secondary);"></i> Sistema</h6>
    </div>
    <div class="settings-body">
        <form id="settingsForm-system" onsubmit="event.preventDefault();Admin.saveSettings('system');">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div>
                    <label class="form-label">Nome do Site</label>
                    <input type="text" name="site_name" class="form-control"
                        value="<?= htmlspecialchars($config['system']['site_name'] ?? 'Rugemtugem Assinaturas') ?>">
                </div>
                <div>
                    <label class="form-label">E-mail do Admin</label>
                    <input type="email" name="admin_email" class="form-control"
                        value="<?= htmlspecialchars($config['system']['admin_email'] ?? '') ?>">
                </div>
            </div>
            <div style="margin-top:1rem;display:flex;align-items:center;gap:12px;">
                <label class="form-label" style="margin:0;">Modo Manutenção</label>
                <label class="toggle-switch">
                    <input type="checkbox" name="maintenance_mode" value="1"
                        <?= !empty($config['system']['maintenance_mode']) ? 'checked' : '' ?>>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div style="margin-top:1rem;">
                <button type="submit" class="btn-admin primary"><i class="bi bi-check-lg"></i> Salvar Sistema</button>
            </div>
        </form>
    </div>
</div>

<!-- Danger Zone -->
<div class="settings-card danger-zone">
    <div class="settings-header">
        <h6><i class="bi bi-exclamation-triangle"></i> Zona de Perigo</h6>
    </div>
    <div class="settings-body">
        <div style="display:flex;flex-wrap:wrap;gap:1rem;">
            <button class="btn-admin danger" onclick="Admin.dangerAction('clear_uploads')">
                <i class="bi bi-trash"></i> Limpar Todos os Uploads
            </button>
            <button class="btn-admin danger" onclick="Admin.dangerAction('reset_stats')">
                <i class="bi bi-arrow-counterclockwise"></i> Resetar Estatísticas
            </button>
            <button class="btn-admin secondary" onclick="Admin.dangerAction('backup')">
                <i class="bi bi-download"></i> Backup Completo (ZIP)
            </button>
        </div>
    </div>
</div>