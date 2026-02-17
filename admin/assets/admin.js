/**
 * Admin Panel — Command Center JavaScript
 * Rugemtugem v2.0
 */

const Admin = {
    currentSection: 'dashboard',

    // ─── INIT ────────────────────────────────────────────
    init() {
        this.initNavigation();
        this.initMobileToggle();
        this.loadSection(this.currentSection);
    },

    // ─── NAVIGATION ──────────────────────────────────────
    initNavigation() {
        document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section !== this.currentSection) {
                    this.loadSection(section);
                }
                // Close mobile sidebar
                this.closeMobileSidebar();
            });
        });
    },

    loadSection(section) {
        // Update sidebar active state
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.sidebar-link[data-section="${section}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Update header title
        const titles = {
            dashboard: 'Dashboard',
            uploads: 'Galeria de Uploads',
            logs: 'Logs & Auditoria',
            settings: 'Configurações'
        };
        const headerTitle = document.getElementById('headerTitle');
        if (headerTitle) headerTitle.textContent = titles[section] || section;

        // Swap section visibility
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`section-${section}`);
        if (target) {
            target.classList.add('active');
            // Re-trigger animation
            target.style.animation = 'none';
            target.offsetHeight; // force reflow
            target.style.animation = '';
        }

        this.currentSection = section;

        // Fire section-specific loaders
        if (section === 'dashboard') this.loadDashboard();
        if (section === 'uploads') this.loadUploads();
        if (section === 'logs') this.loadLogs();
    },

    // ─── MOBILE ──────────────────────────────────────────
    initMobileToggle() {
        const toggle = document.getElementById('mobileToggle');
        const sidebar = document.querySelector('.admin-sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');

        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
                backdrop.classList.toggle('show');
            });
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeMobileSidebar());
        }
    },

    closeMobileSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (sidebar) sidebar.classList.remove('show');
        if (backdrop) backdrop.classList.remove('show');
    },

    // ─── TOAST ───────────────────────────────────────────
    toast(message, type = 'info') {
        let container = document.querySelector('.admin-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'admin-toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };

        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    // ─── CONFIRM ─────────────────────────────────────────
    confirm(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="btn-admin secondary" data-action="cancel">Cancelar</button>
                    <button class="btn-admin danger" data-action="confirm">Confirmar</button>
                </div>
            </div>
        `;

        overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => overlay.remove());
        overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            overlay.remove();
            onConfirm();
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    },

    // ─── COUNT UP ────────────────────────────────────────
    countUp(el, end, duration = 1200) {
        const start = 0;
        const startTime = performance.now();
        const isDecimal = String(end).includes('.');

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = start + (end - start) * eased;

            el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    },

    // ─── FETCH WRAPPER ───────────────────────────────────
    async fetch(url, options = {}) {
        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(options.headers || {})
                }
            });

            if (res.status === 401) {
                window.location.href = 'admin.php';
                return null;
            }

            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Admin fetch error:', err);
            this.toast('Erro na comunicação com o servidor', 'error');
            return null;
        }
    },

    // ─── FORMAT HELPERS ──────────────────────────────────
    formatBytes(bytes) {
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return bytes + ' B';
    },

    timeAgo(isoDate) {
        const now = new Date();
        const date = new Date(isoDate);
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'agora';
        if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
        if (seconds < 172800) return 'ontem';
        return `há ${Math.floor(seconds / 86400)} dias`;
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    // ─── DASHBOARD ───────────────────────────────────────
    async loadDashboard() {
        const data = await this.fetch('api/stats.php?t=' + Date.now());
        if (!data) return;

        // Animate KPIs
        const kpiTotal = document.getElementById('kpiTotal');
        const kpiPhotos = document.getElementById('kpiPhotos');
        const kpiLogos = document.getElementById('kpiLogos');
        const kpiDisk = document.getElementById('kpiDisk');

        if (kpiTotal) this.countUp(kpiTotal, data.total_uploads);
        if (kpiPhotos) this.countUp(kpiPhotos, data.fotos);
        if (kpiLogos) this.countUp(kpiLogos, data.logos);
        if (kpiDisk) this.countUp(kpiDisk, data.disk_used_mb);

        // Disk progress
        const diskBar = document.getElementById('diskProgressBar');
        if (diskBar) {
            const pct = Math.min((data.disk_used_mb / data.disk_limit_mb) * 100, 100);
            setTimeout(() => diskBar.style.width = pct + '%', 100);
        }

        // Disk sub-label
        const diskSub = document.getElementById('kpiDiskSub');
        if (diskSub) diskSub.textContent = `de ${data.disk_limit_mb} MB`;

        // Render 7-day chart
        this.renderChart(data.uploads_7d || [0, 0, 0, 0, 0, 0, 0]);

        // Render recent uploads
        this.renderRecentTable(data.recent_uploads || []);

        // System health
        this.renderHealth(data.system_status || {});

        // Remove skeletons
        document.querySelectorAll('.skeleton-wrap').forEach(s => s.remove());
        document.querySelectorAll('.data-content').forEach(el => el.style.display = '');
    },

    // ─── SVG CHART (7-day bar chart) ─────────────────────
    renderChart(data) {
        const container = document.getElementById('chartContainer');
        if (!container) return;

        const max = Math.max(...data, 1);
        const w = container.clientWidth || 400;
        const h = 160;
        const barW = Math.min((w - 80) / 7 - 8, 40);
        const startX = (w - (barW + 8) * 7 + 8) / 2;

        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3));
        }

        let bars = '';
        data.forEach((val, i) => {
            const barH = Math.max((val / max) * (h - 40), 2);
            const x = startX + i * (barW + 8);
            const y = h - barH - 25;

            bars += `<rect class="chart-bar" x="${x}" y="${y}" width="${barW}" height="${barH}" 
                      data-value="${val}" data-day="${days[i]}"/>`;
            bars += `<text class="chart-value" x="${x + barW / 2}" y="${y - 6}">${val}</text>`;
            bars += `<text class="chart-label" x="${x + barW / 2}" y="${h - 8}">${days[i]}</text>`;
        });

        container.innerHTML = `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}">${bars}</svg>`;
    },

    // ─── RECENT UPLOADS TABLE ────────────────────────────
    renderRecentTable(uploads) {
        const tbody = document.getElementById('recentTableBody');
        if (!tbody) return;

        if (uploads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:var(--text-muted);padding:2rem;">Nenhum upload ainda</td></tr>`;
            return;
        }

        tbody.innerHTML = uploads.slice(0, 10).map(u => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <img src="${u.url}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;" alt="" onerror="this.style.display='none'">
                        <span style="font-size:0.82rem;">${this.escapeHtml(u.filename)}</span>
                    </div>
                </td>
                <td><span class="badge-type ${u.type}">${u.type === 'logo' ? 'Logo' : 'Foto'}</span></td>
                <td style="font-family:var(--font-display);font-size:0.82rem;color:var(--text-muted);">${u.size_kb} KB</td>
                <td style="font-family:var(--font-display);font-size:0.82rem;color:var(--text-muted);">${this.timeAgo(u.date)}</td>
            </tr>
        `).join('');
    },

    // ─── SYSTEM HEALTH ───────────────────────────────────
    renderHealth(status) {
        const container = document.getElementById('healthGrid');
        if (!container) return;

        const items = [
            {
                label: 'Pasta uploads/',
                value: status.uploads_writable ? 'Gravável' : 'Sem permissão',
                status: status.uploads_writable ? 'ok' : 'fail'
            },
            {
                label: 'PHP',
                value: status.php_version,
                status: 'ok'
            },
            {
                label: 'Espaço livre',
                value: status.free_mb + ' MB',
                status: status.free_mb > 100 ? 'ok' : (status.free_mb > 20 ? 'warn' : 'fail')
            },
            {
                label: 'Max upload',
                value: status.max_upload_mb + ' MB',
                status: 'ok'
            }
        ];

        container.innerHTML = items.map(i => `
            <div class="health-item">
                <span class="health-dot ${i.status}"></span>
                <span class="health-label">${i.label}</span>
                <span class="health-value">${i.value}</span>
            </div>
        `).join('');
    },

    // ─── UPLOADS SECTION ─────────────────────────────────
    uploadsData: [],
    uploadsFilter: 'all',
    uploadsSearch: '',
    uploadsSort: 'date',
    selectedFiles: new Set(),

    async loadUploads() {
        const data = await this.fetch('api/stats.php?full=1&t=' + Date.now());
        if (!data || !data.all_uploads) return;

        this.uploadsData = data.all_uploads;
        this.selectedFiles.clear();
        this.renderUploadsGrid();
    },

    renderUploadsGrid() {
        const grid = document.getElementById('uploadsGrid');
        if (!grid) return;

        let filtered = [...this.uploadsData];

        // Filter
        if (this.uploadsFilter !== 'all') {
            filtered = filtered.filter(u => u.type === this.uploadsFilter);
        }

        // Search
        if (this.uploadsSearch) {
            const q = this.uploadsSearch.toLowerCase();
            filtered = filtered.filter(u => u.filename.toLowerCase().includes(q));
        }

        // Sort
        if (this.uploadsSort === 'date') filtered.sort((a, b) => b.timestamp - a.timestamp);
        if (this.uploadsSort === 'size') filtered.sort((a, b) => b.size - a.size);
        if (this.uploadsSort === 'name') filtered.sort((a, b) => a.filename.localeCompare(b.filename));

        // Update count
        const countEl = document.getElementById('uploadsCount');
        if (countEl) countEl.textContent = filtered.length + ' arquivo(s)';

        // Selected count
        this.updateDeleteBtn();

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="bi bi-images"></i><p>Nenhum arquivo encontrado</p></div>`;
            return;
        }

        grid.innerHTML = filtered.map(u => `
            <div class="upload-card ${this.selectedFiles.has(u.filename) ? 'selected' : ''}" data-file="${this.escapeHtml(u.filename)}">
                <div class="card-checkbox">
                    <input type="checkbox" class="admin-check upload-check" ${this.selectedFiles.has(u.filename) ? 'checked' : ''}>
                </div>
                <div class="thumb-wrap">
                    <img src="${u.url}" alt="${this.escapeHtml(u.filename)}" loading="lazy">
                    <div class="thumb-overlay">
                        <button class="overlay-btn" title="Visualizar" onclick="Admin.previewFile('${this.escapeHtml(u.filename)}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="overlay-btn" title="Deletar" onclick="Admin.deleteFile('${this.escapeHtml(u.filename)}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-info">
                    <div class="card-filename" title="${this.escapeHtml(u.filename)}">${this.escapeHtml(u.filename)}</div>
                    <div class="card-meta">
                        <span class="badge-type ${u.type}">${u.type === 'logo' ? 'Logo' : 'Foto'}</span>
                        ${u.is_new ? '<span class="badge-type new">NOVO</span>' : ''}
                        <span>${u.size_kb} KB</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Bind checkbox events
        grid.querySelectorAll('.upload-check').forEach(cb => {
            cb.addEventListener('change', (e) => {
                e.stopPropagation();
                const card = cb.closest('.upload-card');
                const file = card.dataset.file;
                if (cb.checked) {
                    this.selectedFiles.add(file);
                    card.classList.add('selected');
                } else {
                    this.selectedFiles.delete(file);
                    card.classList.remove('selected');
                }
                this.updateDeleteBtn();
            });
        });
    },

    updateDeleteBtn() {
        const btn = document.getElementById('deleteSelectedBtn');
        if (btn) {
            const count = this.selectedFiles.size;
            btn.textContent = count > 0 ? `Deletar (${count})` : 'Deletar selecionados';
            btn.disabled = count === 0;
        }
    },

    filterUploads(type) {
        this.uploadsFilter = type;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.filter-btn[data-filter="${type}"]`)?.classList.add('active');
        this.renderUploadsGrid();
    },

    sortUploads(sort) {
        this.uploadsSort = sort;
        this.renderUploadsGrid();
    },

    searchUploads(query) {
        this.uploadsSearch = query;
        this.renderUploadsGrid();
    },

    selectAllUploads(checked) {
        if (checked) {
            this.uploadsData.forEach(u => this.selectedFiles.add(u.filename));
        } else {
            this.selectedFiles.clear();
        }
        this.renderUploadsGrid();
    },

    async deleteFile(filename) {
        this.confirm(`Deletar <strong>${filename}</strong>?`, async () => {
            const result = await this.fetch('api/delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: [filename] })
            });

            if (result && result.deleted && result.deleted.length) {
                const card = document.querySelector(`.upload-card[data-file="${filename}"]`);
                if (card) {
                    card.classList.add('removing');
                    setTimeout(() => {
                        this.uploadsData = this.uploadsData.filter(u => u.filename !== filename);
                        this.selectedFiles.delete(filename);
                        this.renderUploadsGrid();
                    }, 300);
                }
                this.toast(`${filename} deletado`, 'success');
            } else {
                this.toast('Erro ao deletar', 'error');
            }
        });
    },

    async deleteSelected() {
        const files = [...this.selectedFiles];
        if (!files.length) return;

        this.confirm(`Deletar <strong>${files.length}</strong> arquivo(s)?`, async () => {
            const result = await this.fetch('api/delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
            });

            if (result && result.deleted) {
                result.deleted.forEach(f => {
                    this.uploadsData = this.uploadsData.filter(u => u.filename !== f);
                    this.selectedFiles.delete(f);
                });
                this.renderUploadsGrid();
                this.toast(`${result.deleted.length} arquivo(s) deletado(s)`, 'success');
                if (result.errors && result.errors.length) {
                    this.toast(`${result.errors.length} erro(s) ao deletar`, 'warning');
                }
            }
        });
    },

    previewFile(filename) {
        const file = this.uploadsData.find(u => u.filename === filename);
        if (!file) return;

        const modal = document.getElementById('previewModal');
        document.getElementById('previewImg').src = file.url;
        document.getElementById('previewFilename').textContent = file.filename;
        document.getElementById('previewType').textContent = file.type === 'logo' ? 'Logo' : 'Foto';
        document.getElementById('previewSize').textContent = file.size_kb + ' KB';
        document.getElementById('previewDate').textContent = this.formatDate(file.date);
        document.getElementById('previewUrl').value = file.url;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    copyPreviewUrl() {
        const url = document.getElementById('previewUrl').value;
        navigator.clipboard.writeText(url).then(() => {
            this.toast('URL copiada!', 'success');
        });
    },

    // ─── LOGS ────────────────────────────────────────────
    logsData: [],
    logsFilter: 'all',
    logsStatusFilter: 'all',

    async loadLogs() {
        const data = await this.fetch('api/stats.php?logs=1&t=' + Date.now());
        if (!data || !data.logs) return;
        this.logsData = data.logs;
        this.renderLogs();
    },

    renderLogs() {
        const tbody = document.getElementById('logsTableBody');
        if (!tbody) return;

        let filtered = [...this.logsData];

        if (this.logsFilter !== 'all') {
            filtered = filtered.filter(l => l.action === this.logsFilter);
        }
        if (this.logsStatusFilter !== 'all') {
            filtered = filtered.filter(l => l.status === this.logsStatusFilter);
        }

        const searchEl = document.getElementById('logsSearch');
        if (searchEl && searchEl.value) {
            const q = searchEl.value.toLowerCase();
            filtered = filtered.filter(l =>
                (l.detail && l.detail.toLowerCase().includes(q)) ||
                (l.ip && l.ip.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:var(--text-muted);padding:2rem;">Nenhum log encontrado</td></tr>`;
            return;
        }

        const actionIcons = {
            login: 'bi-box-arrow-in-right',
            delete: 'bi-trash',
            upload: 'bi-cloud-arrow-up',
            export: 'bi-download',
            config: 'bi-gear',
            logout: 'bi-box-arrow-right'
        };

        tbody.innerHTML = filtered.map(l => `
            <tr>
                <td style="font-family:var(--font-display);font-size:0.78rem;color:var(--text-muted);">${this.formatDate(l.ts)}</td>
                <td><span class="log-action-badge ${l.action}"><i class="bi ${actionIcons[l.action] || 'bi-activity'}"></i> ${l.action}</span></td>
                <td style="font-size:0.83rem;">${this.escapeHtml(l.detail || '-')}</td>
                <td style="font-family:var(--font-display);font-size:0.78rem;color:var(--text-muted);">${l.ip || '-'}</td>
                <td><span class="badge-status ${l.status}">${l.status}</span></td>
            </tr>
        `).join('');
    },

    filterLogs(action) {
        this.logsFilter = action;
        document.querySelectorAll('.log-filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.log-filter-btn[data-filter="${action}"]`)?.classList.add('active');
        this.renderLogs();
    },

    filterLogsStatus(status) {
        this.logsStatusFilter = status;
        this.renderLogs();
    },

    async clearLogs() {
        this.confirm('Limpar todos os logs?', async () => {
            const result = await this.fetch('api/stats.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'clear_logs' })
            });
            if (result && result.success) {
                this.logsData = [];
                this.renderLogs();
                this.toast('Logs limpos', 'success');
            }
        });
    },

    // ─── SETTINGS ────────────────────────────────────────
    async saveSettings(section) {
        const form = document.getElementById(`settingsForm-${section}`);
        if (!form) return;

        const formData = new FormData(form);
        const data = {};
        formData.forEach((v, k) => data[k] = v);
        data.section = section;

        // Disable button temporarily
        const btn = form.querySelector('.btn-admin.primary');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Salvando...';
        btn.disabled = true;

        const result = await this.fetch('api/stats.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_settings', ...data })
        });

        setTimeout(() => {
            btn.innerHTML = origText;
            btn.disabled = false;
        }, 600);

        if (result && result.success) {
            this.toast('Configurações salvas!', 'success');
        } else {
            this.toast(result?.error || 'Erro ao salvar', 'error');
        }
    },

    async dangerAction(action) {
        const messages = {
            clear_uploads: 'DELETAR TODOS os uploads? Esta ação é <strong>irreversível</strong>.',
            reset_stats: 'Resetar todas as estatísticas?',
            backup: 'Gerar backup completo para download?'
        };

        this.confirm(messages[action] || 'Tem certeza?', async () => {
            if (action === 'backup') {
                window.open('api/export.php?type=backup&t=' + Date.now(), '_blank');
                this.toast('Backup gerado!', 'success');
                return;
            }

            const result = await this.fetch('api/stats.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (result && result.success) {
                this.toast('Ação executada com sucesso', 'success');
                if (action === 'clear_uploads') this.loadUploads();
            } else {
                this.toast(result?.error || 'Erro', 'error');
            }
        });
    },

    // ─── EXPORT ──────────────────────────────────────────
    exportCSV(type) {
        window.open(`api/export.php?type=${type}&t=${Date.now()}`, '_blank');
        this.toast(`Exportando ${type}...`, 'info');
    },

    // ─── UTILS ───────────────────────────────────────────
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// ─── CSS for spin animation ──────────────────────────────
const spinStyle = document.createElement('style');
spinStyle.textContent = `.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

// ─── INIT on DOM ready ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => Admin.init());
