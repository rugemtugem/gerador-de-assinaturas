/* ===== TOAST NOTIFICATION SYSTEM ===== */
/**
 * Exibe uma notificação toast animada
 * @param {string} message - Mensagem a exibir
 * @param {'success'|'error'|'info'} type - Tipo de notificação
 * @param {number} duration - Duração em ms (padrão 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;

  const icons = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };

  toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ===== CONTACT ICONS (Flaticon CDN PNG — email-client safe) ===== */
const PNG_ICONS = {
  email: `<img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" width="16" height="16" alt="Email" style="display:block;border:0;">`,
  phone: `<img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" width="16" height="16" alt="Telefone" style="display:block;border:0;">`,
  location: `<img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" width="16" height="16" alt="Local" style="display:block;border:0;">`,
  globe: `<img src="https://cdn-icons-png.flaticon.com/128/3687/3687554.png" width="16" height="16" alt="Website" style="display:block;border:0;">`,
  building: `<img src="https://cdn-icons-png.flaticon.com/128/4514/4514940.png" width="16" height="16" alt="Empresa" style="display:inline-block;vertical-align:middle;margin-right:4px;border:0;">`
};

/* ===== PALETTE SYSTEM ===== */
const PALETTES = {
  rugemtugem: { primary: '#992A2B', secondary: '#EE6936', name: 'Rugemtugem' },
  ocean: { primary: '#0077B6', secondary: '#00B4D8', name: 'Ocean' },
  forest: { primary: '#2D6A4F', secondary: '#52B788', name: 'Forest' },
  midnight: { primary: '#7B2CBF', secondary: '#C77DFF', name: 'Midnight' },
  sunset: { primary: '#E63946', secondary: '#F4A261', name: 'Sunset' }
};

/** Retorna as cores ativas {primary, secondary} */
function getActiveColors() {
  const saved = localStorage.getItem('signaturePalette');
  if (saved === 'custom') {
    return {
      primary: localStorage.getItem('signatureCustomPrimary') || '#992A2B',
      secondary: localStorage.getItem('signatureCustomSecondary') || '#EE6936'
    };
  }
  return PALETTES[saved] || PALETTES.rugemtugem;
}

/** Retorna o ícone PNG para uso em templates */
function coloredIcon(iconKey) {
  return PNG_ICONS[iconKey] || '';
}

/** Seleciona uma paleta e atualiza o preview */
function selectPalette(name) {
  // Atualiza UI
  document.querySelectorAll('.palette-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`[data-palette="${name}"]`);
  if (card) card.classList.add('active');

  // Mostra/esconde custom pickers
  const customPickers = document.getElementById('customColorPickers');
  customPickers.style.display = name === 'custom' ? 'block' : 'none';

  // Salva no localStorage
  localStorage.setItem('signaturePalette', name);

  // Atualiza preview com debounce
  if (typeof updatePreview === 'function') updatePreview();
}

// Inicializa paleta salva no load
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('signaturePalette') || 'rugemtugem';
  selectPalette(saved);

  // Custom color picker listeners
  const customPrimary = document.getElementById('customPrimary');
  const customSecondary = document.getElementById('customSecondary');
  if (customPrimary) {
    customPrimary.value = localStorage.getItem('signatureCustomPrimary') || '#992A2B';
    customPrimary.addEventListener('input', (e) => {
      localStorage.setItem('signatureCustomPrimary', e.target.value);
      if (typeof updatePreview === 'function') updatePreview();
    });
  }
  if (customSecondary) {
    customSecondary.value = localStorage.getItem('signatureCustomSecondary') || '#EE6936';
    customSecondary.addEventListener('input', (e) => {
      localStorage.setItem('signatureCustomSecondary', e.target.value);
      if (typeof updatePreview === 'function') updatePreview();
    });
  }
});

/* ===== FUNCIONALIDADE DRAG & DROP ===== */
/**
 * Configura a funcionalidade de arrastar e soltar para áreas de upload
 * @param {HTMLElement} uploadArea - Elemento da área de upload
 * @param {HTMLInputElement} fileInput - Input file correspondente
 */
function setupDragAndDrop(uploadArea, fileInput) {
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      updateFileUploadDisplay(uploadArea, files[0].name);
    }
  });
}

/**
 * Atualiza a exibição visual da área de upload após seleção de arquivo
 * @param {HTMLElement} uploadArea - Área de upload a ser atualizada
 * @param {string} fileName - Nome do arquivo selecionado
 */
function updateFileUploadDisplay(uploadArea, fileName) {
  uploadArea.innerHTML = `
        <i class="bi bi-check-circle upload-icon text-success"></i>
        <p class="mb-0 text-success">${fileName}</p>
        <small class="text-muted">Arquivo selecionado</small>
      `;
}

/* ===== INICIALIZAÇÃO DO DOM ===== */
document.addEventListener('DOMContentLoaded', () => {
  const photoUpload = document.querySelector('.photo-upload');
  const logoUpload = document.querySelector('.logo-upload');
  const photoInput = document.getElementById('photo');
  const logoInput = document.getElementById('logo');

  setupDragAndDrop(photoUpload, photoInput);
  setupDragAndDrop(logoUpload, logoInput);

  photoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      updateFileUploadDisplay(photoUpload, e.target.files[0].name);
    }
  });

  logoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      updateFileUploadDisplay(logoUpload, e.target.files[0].name);
    }
  });
});

/* ===== FUNÇÃO DE UPLOAD DE IMAGEM ===== */
/**
 * Faz upload de uma imagem para o servidor
 * @param {string} inputId - ID do input file
 * @returns {Promise<string>} URL da imagem uploadada ou string vazia
 */
async function uploadImage(inputId, type) {
  const input = document.getElementById(inputId);
  if (!input.files[0]) return '';

  const fd = new FormData();
  fd.append('image', input.files[0]);
  fd.append('type', type || 'photo');

  try {
    const res = await fetch('upload.php', { method: 'POST', body: fd });
    const data = await res.json();
    return data.url || '';
  } catch (error) {
    console.error('Erro no upload:', error);
    return '';
  }
}

/* ===== MANIPULADOR DO FORMULÁRIO ===== */
document.getElementById('sigForm').addEventListener('submit', async e => {
  e.preventDefault();

  const loadingSpinner = document.getElementById('loadingSpinner');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  loadingSpinner.style.display = 'inline-block';
  submitBtn.disabled = true;

  try {
    // Upload paralelo das duas imagens
    const [photoURL, logoURL] = await Promise.all([
      uploadImage('photo', 'photo'),
      uploadImage('logo', 'logo'),
    ]);

    // Atualiza display visual após upload
    const photoInput = document.getElementById('photo');
    const logoInput = document.getElementById('logo');
    const photoUploadArea = document.querySelector('.file-upload-area:first-of-type');
    const logoUploadArea = document.querySelector('.file-upload-area:last-of-type');

    if (photoURL && photoInput.files[0]) {
      updateFileUploadDisplay(photoUploadArea, photoInput.files[0].name);
    }
    if (logoURL && logoInput.files[0]) {
      updateFileUploadDisplay(logoUploadArea, logoInput.files[0].name);
    }

    // Coleta dados do formulário
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const departamento = document.getElementById('departamento').value;
    const company = document.getElementById('company').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value.replace(/\n/g, '<br>');
    const phone = document.getElementById('phone').value;
    const websiteInput = document.getElementById('website');
    let website = websiteInput.value.trim();

    // Adiciona https:// se não houver protocolo
    if (!/^https?:\/\//i.test(website)) {
      website = 'https://' + website;
    }

    // Validação do URL
    let websiteIsValid = true;
    try {
      new URL(website);
    } catch (_) {
      websiteIsValid = false;
    }

    if (!website || !websiteIsValid) {
      showToast('Por favor, insira uma URL válida para o website!', 'error');
      websiteInput.focus();
      loadingSpinner.style.display = 'none';
      submitBtn.disabled = false;
      return;
    }

    websiteInput.value = website;

    function sanitizeUsername(user) {
      if (!user) return "";
      user = user.replace(/^.*[\/@]/, "");
      user = user.replace(/[^a-zA-Z0-9_.-]/g, "");
      return user;
    }

    const linkedinUser = sanitizeUsername(document.getElementById('linkedin').value.trim());
    const instagramUser = sanitizeUsername(document.getElementById('instagram').value.trim());
    const twitterUser = sanitizeUsername(document.getElementById('twitter').value.trim());

    const linkedin = linkedinUser ? "https://linkedin.com/in/" + linkedinUser : "";
    const instagram = instagramUser ? "https://instagram.com/" + instagramUser : "";
    const twitter = twitterUser ? "https://twitter.com/" + twitterUser : "";

    const template = document.getElementById('template').value;


    // ===== GERAÇÃO DO HTML DA ASSINATURA =====
    let html = "";

    if (template === 'modelo1') {
      html = `
  <table cellpadding="0" cellspacing="0" border="0" style="font-family:'Times New Roman';">
    <tbody>
      <tr><td>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <!-- Coluna das imagens (foto + logo) -->
            <td valign="middle" align="center" style="padding:0px 33px 0px 0px;vertical-align:middle">
              <!-- Foto do colaborador -->
              ${photoURL ? `
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0px 1px 24px 0px">
                    <img src="${photoURL}" alt="Foto do colaborador" width="150" height="150" style="outline:0;display:block;border:0;max-width:150px;border-radius:8px;">
                  </td>
                </tr>
              </table>
              ` : ''}
              <!-- Logo da empresa -->
              ${logoURL ? `
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0px 1px 0px 0px">
                    <a href="${website}" target="_blank" style="text-decoration:none">
                      <img src="${logoURL}" alt="Logo da empresa" width="150" height="97" style="display:block;border:0;max-width:150px">
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
            <!-- Divisor vertical -->
            <td style="padding:1px 0px 0px;border-right:2px solid #992A2B"></td>
            <!-- Coluna das informações textuais -->
            <td valign="middle" style="padding:0px 1px 0px 33px;vertical-align:middle">
              <table cellpadding="0" cellspacing="0" border="0">
                <!-- Informações pessoais e profissionais -->
                <tr>
                  <td style="font-family:Arial,sans-serif;padding:0px 1px 19px 0px;font-size:13px;line-height:18px">
                    <p style="font-weight:700;color:#992A2B;margin:1px">${name}</p>
                    ${role ? `<p style="color:rgb(136,136,136);margin:1px">${role}</p>` : ''}
                    ${departamento ? `<p style="color:rgb(136,136,136);margin:1px">${departamento}</p>` : ''}
                    ${company ? `<p style="color:rgb(136,136,136);margin:1px">${PNG_ICONS.building}${company}</p>` : ''}
                  </td>
                </tr>
                <!-- Informações de contato com ícones -->
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <!-- Email com ícone -->
                      ${email ? `
                      <tr>
                        <td style="padding:1px 5px 1px 0px;vertical-align:middle">
                          ${PNG_ICONS.email}
                        </td>
                        <td style="line-height:18px;vertical-align:middle">
                          <a href="mailto:${email}" style="text-decoration:none; font-family:Arial,sans-serif;font-size:13px;line-height:18px;color:rgb(136,136,136)">${email}</a>
                        </td>
                      </tr>
                      ` : ''}
${phone ? `
<tr>
  <td style="padding:1px 5px 1px 0px;vertical-align:middle">
    ${PNG_ICONS.phone}
  </td>
  <td style="line-height:18px;vertical-align:middle">
    <a href="tel:${phone.replace(/\D/g, '')}" style="text-decoration:none; font-family:Arial,sans-serif;font-size:13px;line-height:18px;color:rgb(136,136,136)">${phone}</a>
  </td>
</tr>
` : ''}
                      <!-- Endereço com ícone -->
                      ${address ? `
                      <tr>
                        <td style="padding:1px 5px 1px 0px;vertical-align:middle">
                          ${PNG_ICONS.location}
                        </td>
                        <td style="line-height:18px;vertical-align:middle">
                          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" style="text-decoration:none;font-family:Arial,sans-serif;font-size:13px;line-height:18px;color:rgb(136,136,136)">${address}</a>
                        </td>
                      </tr>
                      ` : ''}
                      <!-- Website -->
                      <tr>
                        <td colspan="2" style="line-height:18px;padding:14px 3px 0px 0px">
                          <a href="${website}" target="_blank" style="text-decoration:none">
<span style="font-family:Arial,sans-serif;font-size:13px;line-height:18px;color:#992A2B;font-weight:700">${website.replace(/^https?:\/\//, "")}</span>
                          </a>
                        </td>
                      </tr>
                      <!-- Redes Sociais -->
                      ${(linkedin || instagram || twitter) ? `
                      <tr>
                        <td colspan="2" style="padding:10px 0px 0px 0px">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              ${linkedin ? `
                              <td style="padding:0px 8px 0px 0px">
                                <a href="${linkedin}" target="_blank" style="text-decoration:none">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="24" height="24" style="display:block;border:0" alt="LinkedIn">
                                </a>
                              </td>
                              ` : ''}
                              ${instagram ? `
                              <td style="padding:0px 8px 0px 0px">
                                <a href="${instagram}" target="_blank" style="text-decoration:none">
                                  <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="24" height="24" style="display:block;border:0" alt="Instagram">
                                </a>
                              </td>
                              ` : ''}
                              ${twitter ? `
                              <td style="padding:0px 8px 0px 0px">
                                <a href="${twitter}" target="_blank" style="text-decoration:none">
                                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="24" height="24" style="display:block;border:0" alt="Twitter">
                                </a>
                              </td>
                              ` : ''}
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- Disclaimer de confidencialidade -->
      <tr><td>
        <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
          <tr>
            <td style="font-family:Arial,sans-serif;padding:29px 1px 0px 0px;font-size:10px;line-height:14px;color:rgb(136,136,136)">
              <p style="margin:1px">O conteúdo deste e-mail é confidencial e destina-se apenas ao destinatário especificado na mensagem. É proibido compartilhar qualquer parte desta mensagem com terceiros, sem o consentimento do remetente. Se você recebeu esta mensagem por engano, responda a esta mensagem e prossiga com sua exclusão, para podermos garantir que tal erro não ocorra no futuro.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </tbody>
  </table>`;
    } else if (template === 'modelo2') {
      html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;max-width:500px;">
  <tbody>
    <!-- Header com foto e informações principais -->
    <tr>
      <td style="background:linear-gradient(135deg, #992A2B 0%, #EE6936 100%);padding:20px;border-radius:12px 12px 0 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            ${photoURL ? `
            <td style="width:80px;vertical-align:top">
              <img src="${photoURL}" alt="Foto do colaborador" width="70" height="70" style="border-radius:50%;border:3px solid #fff;display:block;">
            </td>
            ` : ''}
            <td style="vertical-align:top;${photoURL ? 'padding-left:15px;' : ''}">
              <h2 style="color:#fff;margin:0;font-size:18px;font-weight:700">${name}</h2>
              ${role ? `<p style="color:#ff6b6b;margin:5px 0 0 0;font-size:14px;font-weight:500">${role}</p>` : ''}
              ${departamento ? `<p style="color:#e5e7eb;margin:3px 0 0 0;font-size:12px">${departamento}</p>` : ''}
              ${company ? `<p style="color:#e5e7eb;margin:3px 0 0 0;font-size:12px;font-weight:600">${PNG_ICONS.building}${company}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Informações de contato -->
    <tr>
      <td style="background:#f8fafc;padding:20px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${email ? `
          <tr>
            <td style="padding:5px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:20px;vertical-align:middle">
                    ${PNG_ICONS.email}
                  </td>
                  <td style="padding-left:10px;vertical-align:middle">
                    <a href="mailto:${email}" style="color:#992A2B;text-decoration:none;font-size:13px">${email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
${phone ? `
<tr>
  <td style="padding:5px 0;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="width:20px;vertical-align:middle">
          ${PNG_ICONS.phone}
        </td>
        <td style="padding-left:10px;vertical-align:middle">
          <a href="tel:${phone.replace(/\D/g, '')}" style="color:#992A2B;text-decoration:none;font-size:13px">${phone}</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
` : ''}
          ${address ? `
          <tr>
            <td style="padding:5px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:20px;vertical-align:middle">
                    ${PNG_ICONS.location}
                  </td>
                  <td style="padding-left:10px;vertical-align:middle">
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" style="color:#64748b;text-decoration:none;font-size:12px">${address}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <tr>
            <td style="padding:5px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:20px;vertical-align:middle">
                    ${PNG_ICONS.globe}
                  </td>
                  <td style="padding-left:10px;vertical-align:middle">
                      <a href="${website}" style="color:#992A2B;text-decoration:none;font-size:13px;font-weight:600">${website.replace(/^https?:\/\//, '')}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Redes sociais e logo -->
    <tr>
      <td style="background:#fff;padding:15px 20px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="vertical-align:middle">
              ${(linkedin || instagram || twitter) ? `
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color:#64748b;font-size:11px;padding-right:10px">Siga-nos:</td>
                  ${linkedin ? `
                  <td style="padding:0 3px">
                    <a href="${linkedin}" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="20" height="20" style="display:block;border:0" alt="LinkedIn">
                    </a>
                  </td>
                  ` : ''}
                  ${instagram ? `
                  <td style="padding:0 3px">
                    <a href="${instagram}" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="20" height="20" style="display:block;border:0" alt="Instagram">
                    </a>
                  </td>
                  ` : ''}
                  ${twitter ? `
                  <td style="padding:0 3px">
                    <a href="${twitter}" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="20" height="20" style="display:block;border:0" alt="Twitter">
                    </a>
                  </td>
                  ` : ''}
                </tr>
              </table>
              ` : ''}
            </td>
            <td style="text-align:right;vertical-align:middle">
              ${logoURL ? `
              <a href="${website}" target="_blank">
                <img src="${logoURL}" alt="Logo da empresa" style="max-width:100px;max-height:40px;display:block" />
              </a>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Disclaimer -->
    <tr>
      <td style="padding:15px 0 0 0">
        <p style="font-size:9px;color:#94a3b8;line-height:12px;margin:0">
          Este e-mail é confidencial e destinado exclusivamente ao destinatário. É proibido compartilhar sem autorização. Se recebido por engano, delete imediatamente.
        </p>
      </td>
    </tr>
  </tbody>
</table>`;
    } else if (template === 'modelo3') {
      html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:400px;">
  <tbody>
    <!-- Nome e cargo -->
    <tr>
      <td style="padding:0 0 15px 0">
        <h1 style="margin:0;font-size:22px;font-weight:300;color:#992A2B;letter-spacing:-0.5px">${name}</h1>
        ${role ? `<p style="margin:5px 0 0 0;font-size:14px;color:#EE6936;font-weight:400">${role}</p>` : ''}
        ${departamento && company ? `<p style="margin:2px 0 0 0;font-size:13px;color:#999">${departamento} • ${PNG_ICONS.building}${company}</p>` :
          departamento ? `<p style="margin:2px 0 0 0;font-size:13px;color:#999">${departamento}</p>` :
            company ? `<p style="margin:2px 0 0 0;font-size:13px;color:#999">${PNG_ICONS.building}${company}</p>` : ''}
      </td>
    </tr>

    <!-- Linha divisória -->
    <tr>
      <td style="padding:0 0 15px 0">
        <div style="height:2px;background:linear-gradient(90deg, #992A2B, #EE6936);width:60px"></div>
      </td>
    </tr>

    <!-- Informações de contato -->
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" border="0">
          ${email ? `
          <tr>
            <td style="padding:3px 0;font-size:13px;color:#992A2B">
              <a href="mailto:${email}" style="color:#992A2B;text-decoration:none">${email}</a>
            </td>
          </tr>
          ` : ''}
${phone ? `
<tr>
  <td style="padding:3px 0;font-size:13px;color:#992A2B">
    <a href="tel:${phone.replace(/\D/g, '')}" style="color:#992A2B;text-decoration:none">${phone}</a>
  </td>
</tr>
` : ''}

          ${address ? `
          <tr>
            <td style="padding:3px 0;font-size:12px;color:#999">
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" style="color:#999;text-decoration:none">${address}</a>
            </td>
          </tr>
          ` : ''}

          <tr>
            <td style="padding:3px 0;font-size:13px">
              <a href="${website}" style="color:#EE6936;text-decoration:none;font-weight:500">${website.replace(/^https?:\/\//, '')}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Redes sociais e imagens -->
    ${(linkedin || instagram || twitter || photoURL || logoURL) ? `
    <tr>
      <td style="padding:20px 0 0 0">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="vertical-align:middle">
              ${(linkedin || instagram || twitter) ? `
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${linkedin ? `
                  <td style="padding:0 8px 0 0">
                    <a href="${linkedin}" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="18" height="18" style="display:block;border:0;opacity:0.7" alt="LinkedIn">
                    </a>
                  </td>
                  ` : ''}
                  ${instagram ? `
                  <td style="padding:0 8px 0 0">
                    <a href="${instagram}" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" width="18" height="18" style="display:block;border:0;opacity:0.7" alt="Instagram">
                    </a>
                  </td>
                  ` : ''}
                  ${twitter ? `
                  <td style="padding:0 8px 0 0">
                    <a href="${twitter}" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="18" height="18" style="display:block;border:0;opacity:0.7" alt="Twitter">
                    </a>
                  </td>
                  ` : ''}
                </tr>
              </table>
              ` : ''}
            </td>
            <td style="text-align:right;vertical-align:middle">
              ${photoURL ? `
              <img src="${photoURL}" alt="Foto" width="50" height="50" style="border-radius:50%;margin:0 10px 0 0;display:inline-block;vertical-align:middle">
              ` : ''}
              ${logoURL ? `
              <a href="${website}" target="_blank">
                <img src="${logoURL}" alt="Logo" style="max-width:80px;max-height:30px;display:inline-block;vertical-align:middle;opacity:0.8">
              </a>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}

    <!-- Disclaimer minimalista -->
    <tr>
      <td style="padding:25px 0 0 0">
        <p style="font-size:8px;color:#ccc;line-height:10px;margin:0;font-weight:300">
          Confidencial • Uso restrito ao destinatário
        </p>
      </td>
    </tr>
  </tbody>
</table>`;
    } else if (template === 'modelo4') {
      // ===== MODELO 4: Corporate Dark =====
      html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;max-width:600px;width:100%;background:#1a1a2e;border-radius:8px;">
  <tbody>
    <tr>
      <td style="padding:0;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <!-- Borda lateral gradiente -->
            <td style="width:4px;background:linear-gradient(180deg, #992A2B 0%, #EE6936 100%);border-radius:8px 0 0 0;"></td>
            <td style="padding:24px 28px;">
              <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  ${photoURL ? `
                  <td style="width:80px;vertical-align:top;padding-right:20px;">
                    <img src="${photoURL}" alt="Foto" width="70" height="70" style="border-radius:50%;border:3px solid #992A2B;display:block;">
                  </td>
                  ` : ''}
                  <td style="vertical-align:top;">
                    <h2 style="color:#fff;margin:0 0 4px 0;font-size:18px;font-weight:700;letter-spacing:0.5px;">${name}</h2>
                    ${role ? `<p style="color:#EE6936;margin:0 0 2px 0;font-size:14px;font-weight:500;">${role}</p>` : ''}
                    ${departamento ? `<p style="color:#9ca3af;margin:0 0 2px 0;font-size:12px;">${departamento}</p>` : ''}
                    ${company ? `<p style="color:#e5e7eb;margin:0;font-size:12px;font-weight:600;">${PNG_ICONS.building}${company}</p>` : ''}
                  </td>
                </tr>
              </table>
              <!-- Divisor -->
              <div style="height:1px;background:linear-gradient(90deg, #992A2B, #EE6936, transparent);margin:16px 0;"></div>
              <!-- Contato -->
              <table cellpadding="0" cellspacing="0" border="0">
                ${email ? `
                <tr>
                  <td style="padding:4px 8px 4px 0;vertical-align:middle;">
                    ${PNG_ICONS.email}
                  </td>
                  <td style="vertical-align:middle;">
                    <a href="mailto:${email}" style="color:#e5e7eb;text-decoration:none;font-size:13px;">${email}</a>
                  </td>
                </tr>
                ` : ''}
                ${phone ? `
                <tr>
                  <td style="padding:4px 8px 4px 0;vertical-align:middle;">
                    ${PNG_ICONS.phone}
                  </td>
                  <td style="vertical-align:middle;">
                    <a href="tel:${phone.replace(/\D/g, '')}" style="color:#e5e7eb;text-decoration:none;font-size:13px;">${phone}</a>
                  </td>
                </tr>
                ` : ''}
                ${address ? `
                <tr>
                  <td style="padding:4px 8px 4px 0;vertical-align:middle;">
                    ${PNG_ICONS.location}
                  </td>
                  <td style="vertical-align:middle;">
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" style="color:#9ca3af;text-decoration:none;font-size:12px;">${address}</a>
                  </td>
                </tr>
                ` : ''}
                ${website ? `
                <tr>
                  <td style="padding:4px 8px 4px 0;vertical-align:middle;">
                    ${PNG_ICONS.globe}
                  </td>
                  <td style="vertical-align:middle;">
                    <a href="${website}" style="color:#EE6936;text-decoration:none;font-size:13px;font-weight:600;">${website.replace(/^https?:\/\//, '')}</a>
                  </td>
                </tr>
                ` : ''}
              </table>
              ${(linkedin || instagram || twitter) ? `
              <!-- Redes Sociais -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
                <tr>
                  ${linkedin ? `<td style="padding-right:10px;">
                    <a href="${linkedin}" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="18" height="18" alt="LinkedIn" style="display:block;border:0;opacity:0.8;"></a>
                  </td>` : ''}
                  ${instagram ? `<td style="padding-right:10px;">
                    <a href="${instagram}" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="18" height="18" alt="Instagram" style="display:block;border:0;opacity:0.8;"></a>
                  </td>` : ''}
                  ${twitter ? `<td style="padding-right:10px;">
                    <a href="${twitter}" target="_blank"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="18" height="18" alt="Twitter" style="display:block;border:0;opacity:0.8;"></a>
                  </td>` : ''}
                </tr>
              </table>
              ` : ''}
              ${logoURL ? `
              <table cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                <tr><td>
                  <a href="${website}" target="_blank">
                    <img src="${logoURL}" alt="Logo" style="max-width:100px;max-height:35px;display:block;opacity:0.9;">
                  </a>
                </td></tr>
              </table>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Disclaimer -->
    <tr>
      <td style="padding:0 28px 16px 32px;">
        <p style="font-size:8px;color:#4a4a5a;line-height:10px;margin:0;">
          Confidencial • Uso restrito ao destinatário
        </p>
      </td>
    </tr>
  </tbody>
</table>`;
    }

    // Aplica cores da paleta selecionada nos templates gerados
    const colors = getActiveColors();
    html = html.replace(/#992A2B/gi, colors.primary)
      .replace(/#EE6936/gi, colors.secondary);

    // Atualiza o preview com animação
    const previewElement = document.getElementById('sigPreview');
    previewElement.innerHTML = html;
    previewElement.classList.add('fade-in');

    // Popula o textarea com o código HTML
    document.getElementById('sigHTML').value = html;

    // Toast de sucesso
    showToast('Assinatura gerada com sucesso!', 'success');

  } catch (error) {
    console.error('Erro ao gerar assinatura:', error);
    showToast('Erro ao gerar assinatura. Tente novamente.', 'error');
  } finally {
    loadingSpinner.style.display = 'none';
    submitBtn.disabled = false;
  }
});

/* ===== FUNÇÃO PARA COPIAR HTML ===== */
function copyHTML() {
  const textarea = document.getElementById('sigHTML');
  const copyBtn = document.getElementById('copyBtn');

  if (textarea.value.trim() === '') {
    showToast('Gere uma assinatura antes de copiar!', 'error');
    return;
  }

  textarea.select();
  document.execCommand('copy');

  // Feedback visual
  copyBtn.innerHTML = '<i class="bi bi-check me-1"></i>Copiado!';
  copyBtn.classList.remove('btn-secondary');
  copyBtn.classList.add('btn-success');
  showToast('Código HTML copiado!', 'success');

  setTimeout(() => {
    copyBtn.innerHTML = '<i class="bi bi-clipboard me-1"></i>Copiar';
    copyBtn.classList.remove('btn-success');
    copyBtn.classList.add('btn-secondary');
  }, 3000);
}

/* ===== LIVE PREVIEW EM TEMPO REAL ===== */
const formInputs = ['name', 'role', 'departamento', 'company', 'email', 'address', 'website', 'phone'];

formInputs.forEach(inputId => {
  const el = document.getElementById(inputId);
  if (el) {
    el.addEventListener('input', debounce(updatePreview, 400));
  }
});

// Também monitora mudança de template para live preview
document.getElementById('template').addEventListener('change', updatePreview);

/**
 * Função debounce para otimizar chamadas
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Atualiza o preview em tempo real sem upload de imagens
 */
function updatePreview() {
  const name = document.getElementById('name').value;
  if (!name.trim()) return; // Precisa de pelo menos o nome

  const role = document.getElementById('role').value;
  const departamento = document.getElementById('departamento').value;
  const company = document.getElementById('company').value;
  const email = document.getElementById('email').value;
  const address = document.getElementById('address').value.replace(/\n/g, '<br>');
  const phone = document.getElementById('phone').value;
  let website = document.getElementById('website').value.trim();
  if (website && !/^https?:\/\//i.test(website)) {
    website = 'https://' + website;
  }

  function sanitizeUsername(user) {
    if (!user) return "";
    user = user.replace(/^.*[\/@]/, "");
    user = user.replace(/[^a-zA-Z0-9_.-]/g, "");
    return user;
  }

  const linkedinUser = sanitizeUsername(document.getElementById('linkedin').value.trim());
  const instagramUser = sanitizeUsername(document.getElementById('instagram').value.trim());
  const twitterUser = sanitizeUsername(document.getElementById('twitter').value.trim());

  const linkedin = linkedinUser ? "https://linkedin.com/in/" + linkedinUser : "";
  const instagram = instagramUser ? "https://instagram.com/" + instagramUser : "";
  const twitter = twitterUser ? "https://twitter.com/" + twitterUser : "";

  const template = document.getElementById('template').value;
  const photoURL = '';
  const logoURL = '';

  let html = '';

  // Gera preview sem imagens (sem upload)
  if (template === 'modelo1') {
    html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Times New Roman';">
  <tbody><tr><td>
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" align="center" style="padding:0px 33px 0px 0px;vertical-align:middle">
        <div style="width:150px;height:150px;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;text-align:center;">📷 Foto</div>
      </td>
      <td style="padding:1px 0px 0px;border-right:2px solid #992A2B"></td>
      <td valign="middle" style="padding:0px 1px 0px 33px;vertical-align:middle">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="font-family:Arial,sans-serif;padding:0px 1px 19px 0px;font-size:13px;line-height:18px">
            <p style="font-weight:700;color:#992A2B;margin:1px">${name}</p>
            ${role ? `<p style="color:rgb(136,136,136);margin:1px">${role}</p>` : ''}
            ${departamento ? `<p style="color:rgb(136,136,136);margin:1px">${departamento}</p>` : ''}
            ${company ? `<p style="color:rgb(136,136,136);margin:1px">${PNG_ICONS.building}${company}</p>` : ''}
          </td></tr>
          <tr><td>
            <table cellpadding="0" cellspacing="0" border="0">
              ${email ? `<tr><td style="padding:1px 5px 1px 0px;vertical-align:middle">${PNG_ICONS.email}</td><td style="line-height:18px;vertical-align:middle"><span style="font-family:Arial,sans-serif;font-size:13px;color:rgb(136,136,136)">${email}</span></td></tr>` : ''}
              ${phone ? `<tr><td style="padding:1px 5px 1px 0px;vertical-align:middle">${PNG_ICONS.phone}</td><td style="line-height:18px;vertical-align:middle"><span style="font-family:Arial,sans-serif;font-size:13px;color:rgb(136,136,136)">${phone}</span></td></tr>` : ''}
              ${address ? `<tr><td style="padding:1px 5px 1px 0px;vertical-align:middle">${PNG_ICONS.location}</td><td style="line-height:18px;vertical-align:middle"><span style="font-family:Arial,sans-serif;font-size:13px;color:rgb(136,136,136)">${address}</span></td></tr>` : ''}
              ${website ? `<tr><td colspan="2" style="padding:14px 3px 0px 0px"><span style="font-family:Arial,sans-serif;font-size:13px;color:#992A2B;font-weight:700">${website.replace(/^https?:\/\//, "")}</span></td></tr>` : ''}
            </table>
          </td></tr>
        </table>
      </td>
    </tr></table>
  </td></tr></tbody>
</table>`;
  } else if (template === 'modelo2') {
    html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;max-width:500px;width:100%;">
  <tbody>
    <tr><td style="background:linear-gradient(135deg, #992A2B 0%, #EE6936 100%);padding:20px;border-radius:12px 12px 0 0;">
      <h2 style="color:#fff;margin:0;font-size:18px;font-weight:700">${name}</h2>
      ${role ? `<p style="color:#ff6b6b;margin:5px 0 0 0;font-size:14px;font-weight:500">${role}</p>` : ''}
      ${departamento ? `<p style="color:#e5e7eb;margin:3px 0 0 0;font-size:12px">${departamento}</p>` : ''}
      ${company ? `<p style="color:#e5e7eb;margin:3px 0 0 0;font-size:12px;font-weight:600">${PNG_ICONS.building}${company}</p>` : ''}
    </td></tr>
    <tr><td style="background:#f8fafc;padding:20px;border:1px solid #e2e8f0;">
      ${email ? `<p style="margin:5px 0;font-size:13px"><span style="color:#992A2B">${email}</span></p>` : ''}
      ${phone ? `<p style="margin:5px 0;font-size:13px"><span style="color:#992A2B">${phone}</span></p>` : ''}
      ${address ? `<p style="margin:5px 0;font-size:12px;color:#64748b">${address}</p>` : ''}
      ${website ? `<p style="margin:5px 0;font-size:13px;font-weight:600"><span style="color:#992A2B">${website.replace(/^https?:\/\//, '')}</span></p>` : ''}
    </td></tr>
  </tbody>
</table>`;
  } else if (template === 'modelo3') {
    html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:400px;">
  <tbody>
    <tr><td style="padding:0 0 15px 0">
      <h1 style="margin:0;font-size:22px;font-weight:300;color:#992A2B;letter-spacing:-0.5px">${name}</h1>
      ${role ? `<p style="margin:5px 0 0 0;font-size:14px;color:#EE6936;font-weight:400">${role}</p>` : ''}
      ${departamento && company ? `<p style="margin:2px 0 0 0;font-size:13px;color:#999">${departamento} • ${PNG_ICONS.building}${company}</p>` :
        departamento ? `<p style="margin:2px 0 0 0;font-size:13px;color:#999">${departamento}</p>` :
          company ? `<p style="margin:2px 0 0 0;font-size:13px;color:#999">${PNG_ICONS.building}${company}</p>` : ''}
    </td></tr>
    <tr><td style="padding:0 0 15px 0"><div style="height:2px;background:linear-gradient(90deg, #992A2B, #EE6936);width:60px"></div></td></tr>
    <tr><td>
      ${email ? `<p style="padding:3px 0;font-size:13px;color:#992A2B;margin:0">${email}</p>` : ''}
      ${phone ? `<p style="padding:3px 0;font-size:13px;color:#992A2B;margin:0">${phone}</p>` : ''}
      ${address ? `<p style="padding:3px 0;font-size:12px;color:#999;margin:0">${address}</p>` : ''}
      ${website ? `<p style="padding:3px 0;font-size:13px;margin:0"><span style="color:#EE6936;font-weight:500">${website.replace(/^https?:\/\//, '')}</span></p>` : ''}
    </td></tr>
  </tbody>
</table>`;
  } else if (template === 'modelo4') {
    html = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;max-width:600px;width:100%;background:#1a1a2e;border-radius:8px;">
  <tbody>
    <tr>
      <td style="padding:0;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td style="width:4px;background:linear-gradient(180deg, #992A2B 0%, #EE6936 100%);border-radius:8px 0 0 0;"></td>
            <td style="padding:24px 28px;">
              <h2 style="color:#fff;margin:0 0 4px 0;font-size:18px;font-weight:700;letter-spacing:0.5px;">${name}</h2>
              ${role ? `<p style="color:#EE6936;margin:0 0 2px 0;font-size:14px;font-weight:500;">${role}</p>` : ''}
              ${departamento ? `<p style="color:#9ca3af;margin:0 0 2px 0;font-size:12px;">${departamento}</p>` : ''}
              ${company ? `<p style="color:#e5e7eb;margin:0;font-size:12px;font-weight:600;">${PNG_ICONS.building}${company}</p>` : ''}
              <div style="height:1px;background:linear-gradient(90deg, #992A2B, #EE6936, transparent);margin:16px 0;"></div>
              <table cellpadding="0" cellspacing="0" border="0">
                ${email ? `<tr><td style="padding:4px 8px 4px 0;vertical-align:middle;">${PNG_ICONS.email}</td><td style="vertical-align:middle;"><span style="color:#e5e7eb;font-size:13px;">${email}</span></td></tr>` : ''}
                ${phone ? `<tr><td style="padding:4px 8px 4px 0;vertical-align:middle;">${PNG_ICONS.phone}</td><td style="vertical-align:middle;"><span style="color:#e5e7eb;font-size:13px;">${phone}</span></td></tr>` : ''}
                ${address ? `<tr><td style="padding:4px 8px 4px 0;vertical-align:middle;">${PNG_ICONS.location}</td><td style="vertical-align:middle;"><span style="color:#9ca3af;font-size:12px;">${address}</span></td></tr>` : ''}
                ${website ? `<tr><td style="padding:4px 8px 4px 0;vertical-align:middle;">${PNG_ICONS.globe}</td><td style="vertical-align:middle;"><span style="color:#EE6936;font-size:13px;font-weight:600;">${website.replace(/^https?:\/\//, '')}</span></td></tr>` : ''}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </tbody>
</table>`;
  }

  const previewElement = document.getElementById('sigPreview');

  // Aplica cores da paleta selecionada
  const colors = getActiveColors();
  html = html.replace(/#992A2B/gi, colors.primary)
    .replace(/#EE6936/gi, colors.secondary);

  previewElement.innerHTML = html;
}

/**
 * Detecta o cliente de email mais provável pelo user-agent
 * @returns {string} ID da tab a ativar: 'gmail', 'outlook', 'apple', 'outros'
 */
function detectEmailClient() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac') || ua.includes('iphone') || ua.includes('ipad')) return 'apple';
  if (ua.includes('outlook') || ua.includes('microsoft') || ua.includes('msie') || ua.includes('edge')) return 'outlook';
  if (ua.includes('chrome') || ua.includes('firefox')) return 'gmail';
  return 'outros';
}

/**
 * Abre o modal de guia de instalação com a tab correta ativa
 */
function showInstallGuideModal() {
  const detectedClient = detectEmailClient();

  // Ativa a tab do cliente detectado
  const tabBtn = document.getElementById(`${detectedClient}-tab`);
  if (tabBtn) {
    const tabInstance = new bootstrap.Tab(tabBtn);
    tabInstance.show();
  }

  // Abre o modal
  const modal = new bootstrap.Modal(document.getElementById('installGuideModal'));
  modal.show();
}

/**
 * Copia o HTML visível do preview para a área de transferência
 * @param {boolean} skipModal - Se true, não abre o modal (usado pelo botão "Copiar Novamente")
 */
function copyVisibleHTMLFromPreview(skipModal) {
  const sigPreview = document.getElementById('sigPreview');

  const isInitialState = sigPreview.querySelector('.text-center.text-muted.py-4') !== null;
  if (isInitialState) {
    showToast('Gere uma assinatura antes de copiar!', 'error');
    return;
  }

  const htmlContent = sigPreview.innerHTML;

  if (navigator.clipboard && window.ClipboardItem) {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([sigPreview.innerText], { type: 'text/plain' }),
      })
    ]).then(() => {
      showCopyFeedback('copySignatureBtn');
      if (!skipModal) showInstallGuideModal();
    }).catch(err => {
      fallbackCopyHTML(htmlContent);
      showCopyFeedback('copySignatureBtn');
      if (!skipModal) showInstallGuideModal();
    });
  } else {
    fallbackCopyHTML(htmlContent);
    showCopyFeedback('copySignatureBtn');
    if (!skipModal) showInstallGuideModal();
  }
}

function fallbackCopyHTML(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.opacity = '0';
  container.style.zIndex = '-1';

  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNode(container);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }

  document.body.removeChild(container);
}

function showCopyFeedback(buttonId) {
  const copyBtn = document.getElementById(buttonId);

  showToast('Assinatura copiada com sucesso!', 'success');

  copyBtn.innerHTML = '<i class="bi bi-check me-1"></i>Copiado!';
  copyBtn.classList.remove('btn-secondary');
  copyBtn.classList.add('btn-success');

  setTimeout(() => {
    copyBtn.innerHTML = '<i class="bi bi-clipboard me-1"></i>Copiar';
    copyBtn.classList.remove('btn-success');
    copyBtn.classList.add('btn-secondary');
  }, 3000);
}

// Mapeamento dos modelos para imagens e legendas
const modelos = {
  'modelo1': {
    img: 'img/modelo1.png',
    label: 'Modelo 1 (Clássico)'
  },
  'modelo2': {
    img: 'img/modelo2.png',
    label: 'Modelo 2 (Horizontal)'
  },
  'modelo3': {
    img: 'img/modelo3.png',
    label: 'Modelo 3 (Minimalista)'
  },
  'modelo4': {
    img: 'img/modelo3.png',
    label: 'Modelo 4 (Corporate Dark)'
  }
};

document.addEventListener('DOMContentLoaded', function () {
  const select = document.getElementById('template');
  const previewImg = document.getElementById('templatePreviewImg');
  const previewLabel = document.getElementById('templatePreviewLabel');

  select.addEventListener('change', function () {
    const valor = select.value;
    if (modelos[valor]) {
      previewImg.src = modelos[valor].img;
      previewImg.alt = modelos[valor].label;
      previewLabel.textContent = modelos[valor].label;
      // Animação fade-in
      previewImg.classList.remove('fade-in');
      void previewImg.offsetWidth; // reflow
      previewImg.classList.add('fade-in');
    }
  });
});

//Data = Ano atual
const yearElement = document.getElementById('current-year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
