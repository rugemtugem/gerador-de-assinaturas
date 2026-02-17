<!-- ===== DASHBOARD SECTION ===== -->

<!-- KPI Cards -->
<div class="kpi-grid">
    <div class="kpi-card kpi-total">
        <div class="kpi-icon"><i class="bi bi-cloud-arrow-up"></i></div>
        <div class="kpi-value" id="kpiTotal">0</div>
        <div class="kpi-label">Total Uploads</div>
    </div>
    <div class="kpi-card kpi-photos">
        <div class="kpi-icon"><i class="bi bi-person-square"></i></div>
        <div class="kpi-value" id="kpiPhotos">0</div>
        <div class="kpi-label">Fotos</div>
    </div>
    <div class="kpi-card kpi-logos">
        <div class="kpi-icon"><i class="bi bi-building"></i></div>
        <div class="kpi-value" id="kpiLogos">0</div>
        <div class="kpi-label">Logos</div>
    </div>
    <div class="kpi-card kpi-storage">
        <div class="kpi-icon"><i class="bi bi-hdd"></i></div>
        <div class="kpi-value" id="kpiDisk">0</div>
        <div class="kpi-label">MB Armazenados</div>
        <div class="kpi-sub" id="kpiDiskSub">de 500 MB</div>
        <div class="disk-progress">
            <div class="disk-progress-bar" id="diskProgressBar" style="width:0%"></div>
        </div>
    </div>
</div>

<!-- Chart + Recent Uploads Row -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
    <!-- 7-Day Chart -->
    <div class="glass-card">
        <div class="card-title"><i class="bi bi-bar-chart"></i> Uploads — Últimos 7 dias</div>
        <div class="chart-container" id="chartContainer">
            <div class="skeleton skeleton-chart"></div>
        </div>
    </div>

    <!-- Recent Uploads -->
    <div class="glass-card">
        <div class="card-title">
            <i class="bi bi-clock-history"></i> Uploads Recentes
            <button class="btn-admin secondary" style="margin-left:auto;padding:4px 10px;font-size:0.75rem;"
                onclick="Admin.loadDashboard()">
                <i class="bi bi-arrow-clockwise"></i> Atualizar
            </button>
        </div>
        <div style="overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Arquivo</th>
                        <th>Tipo</th>
                        <th>Tamanho</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody id="recentTableBody">
                    <tr>
                        <td colspan="4" style="padding:2rem;text-align:center;color:var(--text-muted);">
                            <div class="skeleton skeleton-text" style="margin:0 auto;"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- System Health -->
<div class="glass-card">
    <div class="card-title"><i class="bi bi-motherboard"></i> Saúde do Sistema</div>
    <div class="health-grid" id="healthGrid">
        <div class="health-item">
            <div class="skeleton" style="width:100%;height:20px;"></div>
        </div>
        <div class="health-item">
            <div class="skeleton" style="width:100%;height:20px;"></div>
        </div>
        <div class="health-item">
            <div class="skeleton" style="width:100%;height:20px;"></div>
        </div>
        <div class="health-item">
            <div class="skeleton" style="width:100%;height:20px;"></div>
        </div>
    </div>
</div>