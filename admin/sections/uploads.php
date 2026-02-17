<!-- ===== UPLOADS GALLERY SECTION ===== -->

<!-- Toolbar -->
<div class="uploads-toolbar">
    <input type="text" class="search-input" placeholder="Buscar arquivo..." oninput="Admin.searchUploads(this.value)"
        id="uploadsSearch">

    <div style="display:flex;gap:6px;">
        <button class="filter-btn active" data-filter="all" onclick="Admin.filterUploads('all')">Todos</button>
        <button class="filter-btn" data-filter="foto" onclick="Admin.filterUploads('foto')">Fotos</button>
        <button class="filter-btn" data-filter="logo" onclick="Admin.filterUploads('logo')">Logos</button>
    </div>

    <select class="search-input" style="min-width:140px;padding:0.4rem 0.75rem;"
        onchange="Admin.sortUploads(this.value)">
        <option value="date">Data ↓</option>
        <option value="size">Tamanho ↓</option>
        <option value="name">Nome A-Z</option>
    </select>

    <div style="display:flex;gap:6px;margin-left:auto;">
        <label
            style="display:flex;align-items:center;gap:6px;color:var(--text-secondary);font-size:0.82rem;cursor:pointer;">
            <input type="checkbox" class="admin-check" onchange="Admin.selectAllUploads(this.checked)">
            Selecionar tudo
        </label>
        <button class="action-btn danger" id="deleteSelectedBtn" disabled onclick="Admin.deleteSelected()">
            <i class="bi bi-trash"></i> Deletar selecionados
        </button>
        <button class="action-btn" onclick="Admin.exportCSV('uploads')">
            <i class="bi bi-download"></i> CSV
        </button>
    </div>
</div>

<!-- Count -->
<div style="margin-bottom:0.75rem;font-size:0.8rem;color:var(--text-muted);" id="uploadsCount">Carregando...</div>

<!-- Grid -->
<div class="upload-grid" id="uploadsGrid">
    <!-- Skeleton loading -->
    <?php for ($i = 0; $i < 8; $i++): ?>
        <div class="upload-card">
            <div class="thumb-wrap">
                <div class="skeleton" style="width:100%;height:100%;"></div>
            </div>
            <div class="card-info">
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton" style="height:10px;width:40%;"></div>
            </div>
        </div>
    <?php endfor; ?>
</div>

<!-- Preview Modal -->
<div class="modal fade preview-modal" id="previewModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="previewFilename">Imagem</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center">
                <img id="previewImg" src="" class="preview-img" alt="Preview">
                <div class="preview-meta">
                    <div class="preview-meta-item">
                        <label>Tipo</label>
                        <span id="previewType">-</span>
                    </div>
                    <div class="preview-meta-item">
                        <label>Tamanho</label>
                        <span id="previewSize">-</span>
                    </div>
                    <div class="preview-meta-item">
                        <label>Data</label>
                        <span id="previewDate">-</span>
                    </div>
                    <div class="preview-meta-item">
                        <label>URL</label>
                        <input type="text" id="previewUrl" readonly class="form-control form-control-sm"
                            style="background:var(--admin-surface-2);border-color:rgba(255,255,255,0.08);color:var(--text-primary);font-size:0.75rem;margin-top:2px;">
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="border-top-color:rgba(255,255,255,0.06);justify-content:space-between;">
                <button class="btn-admin secondary" onclick="Admin.copyPreviewUrl()">
                    <i class="bi bi-link-45deg"></i> Copiar URL
                </button>
                <button class="btn-admin danger"
                    onclick="Admin.deleteFile(document.getElementById('previewFilename').textContent);bootstrap.Modal.getInstance(document.getElementById('previewModal')).hide();">
                    <i class="bi bi-trash"></i> Deletar
                </button>
            </div>
        </div>
    </div>
</div>