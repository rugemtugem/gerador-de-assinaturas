<!-- ===== LOGS & AUDIT SECTION ===== -->

<!-- Toolbar -->
<div class="uploads-toolbar" style="margin-bottom:1rem;">
    <input type="text" class="search-input" id="logsSearch" placeholder="Buscar por IP ou detalhe..."
        oninput="Admin.renderLogs()">

    <div style="display:flex;gap:6px;">
        <button class="filter-btn log-filter-btn active" data-filter="all"
            onclick="Admin.filterLogs('all')">Todos</button>
        <button class="filter-btn log-filter-btn" data-filter="login" onclick="Admin.filterLogs('login')">Login</button>
        <button class="filter-btn log-filter-btn" data-filter="upload"
            onclick="Admin.filterLogs('upload')">Upload</button>
        <button class="filter-btn log-filter-btn" data-filter="delete"
            onclick="Admin.filterLogs('delete')">Delete</button>
        <button class="filter-btn log-filter-btn" data-filter="export"
            onclick="Admin.filterLogs('export')">Export</button>
        <button class="filter-btn log-filter-btn" data-filter="config"
            onclick="Admin.filterLogs('config')">Config</button>
    </div>

    <select class="search-input" style="min-width:120px;padding:0.4rem 0.75rem;"
        onchange="Admin.filterLogsStatus(this.value)">
        <option value="all">Status: Todos</option>
        <option value="ok">✅ OK</option>
        <option value="fail">❌ Falha</option>
    </select>

    <div style="display:flex;gap:6px;margin-left:auto;">
        <button class="action-btn" onclick="Admin.exportCSV('logs')">
            <i class="bi bi-download"></i> Exportar CSV
        </button>
        <button class="action-btn danger" onclick="Admin.clearLogs()">
            <i class="bi bi-trash"></i> Limpar Logs
        </button>
    </div>
</div>

<!-- Logs Table -->
<div class="glass-card" style="padding:0;">
    <div style="overflow-x:auto;">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Data/Hora</th>
                    <th>Ação</th>
                    <th>Detalhe</th>
                    <th>IP</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody id="logsTableBody">
                <tr>
                    <td colspan="5" style="padding:2rem;text-align:center;color:var(--text-muted);">
                        Carregando logs...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>