<?php
/**
 * Admin Panel — Command Center v2.0
 * Router principal com login + sidebar layout
 */
require_once __DIR__ . '/helpers.php';
session_start();

// ===== LOGOUT =====
if (isset($_GET['logout'])) {
    log_action('logout', 'Sessão encerrada', 'ok');
    session_destroy();
    header('Location: admin.php');
    exit;
}

// ===== CONFIG =====
$config = get_config();

// ===== LOGIN =====
$loginError = '';
if (!isset($_SESSION['admin'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['senha'])) {
        if (password_verify($_POST['senha'], $config['auth']['password_hash'])) {
            $_SESSION['admin'] = true;
            $_SESSION['admin_login_time'] = time();
            log_action('login', 'Login bem-sucedido', 'ok');
            header('Location: admin.php');
            exit;
        } else {
            $loginError = 'Senha incorreta!';
            log_action('login', 'Senha incorreta', 'fail');
        }
    }
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#0a0a0f">
        <title>Login — Painel Admin</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
        <link rel="stylesheet" href="assets/admin.css">
        <link rel="icon" type="image/webp" href="../img/logo-nova.webp">
    </head>

    <body class="admin-body">
        <div class="login-wrapper">
            <div class="login-card <?= $loginError ? 'shake' : '' ?>" id="loginCard">
                <div class="text-center">
                    <img src="../img/logo-nova.webp" alt="Rugemtugem" class="login-logo">
                    <h4>Painel Administrativo</h4>
                    <p class="login-subtitle">Gerador de Assinaturas — Command Center</p>
                </div>

                <?php if ($loginError): ?>
                    <div
                        style="background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.3);border-radius:6px;padding:0.6rem 1rem;margin-bottom:1rem;color:#e74c3c;font-size:0.85rem;display:flex;align-items:center;gap:8px;">
                        <i class="bi bi-exclamation-circle"></i> <?= htmlspecialchars($loginError) ?>
                    </div>
                <?php endif; ?>

                <form method="post">
                    <div class="mb-3">
                        <label class="form-label">Senha de acesso</label>
                        <div style="position:relative;">
                            <input type="password" name="senha" class="form-control" required autofocus
                                placeholder="••••••••" id="loginPassword" style="padding-right:40px;">
                            <button type="button" onclick="togglePassword()"
                                style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;">
                                <i class="bi bi-eye" id="toggleIcon"></i>
                            </button>
                        </div>
                    </div>
                    <button type="submit" class="btn-login">
                        <i class="bi bi-box-arrow-in-right me-2"></i> Entrar
                    </button>
                </form>

                <div class="text-center mt-3">
                    <a href="../" style="color:var(--text-muted);font-size:0.8rem;text-decoration:none;">
                        <i class="bi bi-arrow-left"></i> Voltar ao Gerador
                    </a>
                </div>
            </div>
        </div>

        <script>
            function togglePassword() {
                const input = document.getElementById('loginPassword');
                const icon = document.getElementById('toggleIcon');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'bi bi-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'bi bi-eye';
                }
            }
        </script>
    </body>

    </html>
    <?php exit;
}

// ===== SESSION TIMEOUT CHECK =====
$timeout = ($config['auth']['session_timeout_min'] ?? 60) * 60;
if ($timeout > 0 && isset($_SESSION['admin_login_time'])) {
    if ((time() - $_SESSION['admin_login_time']) > $timeout) {
        log_action('logout', 'Timeout de sessão', 'ok');
        session_destroy();
        header('Location: admin.php');
        exit;
    }
    $_SESSION['admin_login_time'] = time(); // refresh
}

// ===== MAINTENANCE MODE CHECK =====
$maintenance = !empty($config['system']['maintenance_mode']);
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0a0a0f">
    <title>Admin — <?= htmlspecialchars($config['system']['site_name'] ?? 'Rugemtugem') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/admin.css">
    <link rel="icon" type="image/webp" href="../img/logo-nova.webp">
</head>

<body class="admin-body">

    <!-- Mobile backdrop -->
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>

    <div class="admin-layout">
        <!-- ===== SIDEBAR ===== -->
        <aside class="admin-sidebar">
            <div class="sidebar-brand">
                <img src="../img/logo-nova.webp" alt="Logo">
                <div>
                    <div class="brand-text">Rugemtugem</div>
                    <div class="brand-sub">Command Center</div>
                </div>
            </div>

            <nav class="sidebar-nav">
                <div class="sidebar-section-label">Visão Geral</div>
                <a class="sidebar-link active" data-section="dashboard">
                    <i class="bi bi-grid-1x2"></i> Dashboard
                </a>

                <div class="sidebar-section-label">Gestão</div>
                <a class="sidebar-link" data-section="uploads">
                    <i class="bi bi-images"></i> Uploads
                </a>
                <a class="sidebar-link" data-section="logs">
                    <i class="bi bi-journal-text"></i> Logs
                </a>

                <div class="sidebar-section-label">Admin</div>
                <a class="sidebar-link" data-section="settings">
                    <i class="bi bi-gear"></i> Configurações
                </a>
            </nav>

            <div class="sidebar-footer">
                <a href="?logout=1" class="btn-logout">
                    <i class="bi bi-box-arrow-left"></i> Sair
                </a>
            </div>
        </aside>

        <!-- ===== MAIN ===== -->
        <main class="admin-main">
            <!-- Header -->
            <header class="admin-header">
                <div style="display:flex;align-items:center;gap:12px;">
                    <button class="mobile-toggle" id="mobileToggle">
                        <i class="bi bi-list"></i>
                    </button>
                    <span class="header-title" id="headerTitle">Dashboard</span>
                </div>
                <div class="header-badges">
                    <?php if ($maintenance): ?>
                        <span class="status-badge"
                            style="background:rgba(243,156,18,0.1);color:var(--warning);border:1px solid rgba(243,156,18,0.2);">
                            <i class="bi bi-tools"></i> Manutenção
                        </span>
                    <?php endif; ?>
                    <span class="status-badge online">
                        <span class="status-dot"></span> Online
                    </span>
                </div>
            </header>

            <!-- Content Area -->
            <div class="admin-content">
                <?php if ($maintenance): ?>
                    <div class="maintenance-banner">
                        <i class="bi bi-exclamation-triangle"></i> Modo manutenção ativado — o frontend principal está
                        desabilitado.
                    </div>
                <?php endif; ?>

                <!-- Dashboard Section -->
                <div class="admin-section active" id="section-dashboard">
                    <?php include __DIR__ . '/sections/dashboard.php'; ?>
                </div>

                <!-- Uploads Section -->
                <div class="admin-section" id="section-uploads">
                    <?php include __DIR__ . '/sections/uploads.php'; ?>
                </div>

                <!-- Logs Section -->
                <div class="admin-section" id="section-logs">
                    <?php include __DIR__ . '/sections/logs.php'; ?>
                </div>

                <!-- Settings Section -->
                <div class="admin-section" id="section-settings">
                    <?php include __DIR__ . '/sections/settings.php'; ?>
                </div>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/admin.js"></script>
</body>

</html>