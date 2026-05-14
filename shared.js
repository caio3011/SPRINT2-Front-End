document.addEventListener('DOMContentLoaded', () => {

  const PAGE = document.body.dataset.page; // '1','2','3'

  const btnHD    = document.getElementById('btn-hd');
  const btnMute  = document.getElementById('btn-mute');
  const btnModes = document.getElementById('btn-modes'); // apenas visual — SEM navegação
  const btnGear  = document.getElementById('btn-gear');
  const floatSet = document.getElementById('float-settings');
  const shutter  = document.getElementById('shutter');
  const timerOv  = document.getElementById('timer-ov');
  const flash    = document.getElementById('flash');
  const vfInner  = document.getElementById('vf-inner');
  const rToast   = document.getElementById('ratio-toast');

  const fbTimer  = document.getElementById('fb-timer');
  const fbFiltro = document.getElementById('fb-filtro');
  const fbRatio  = document.getElementById('fb-ratio');
  const fvTimer  = document.getElementById('fv-timer');
  const fvFiltro = document.getElementById('fv-filtro');
  const fvRatio  = document.getElementById('fv-ratio');

  const galleryBtn     = document.getElementById('gallery-btn');
  const galleryOverlay = document.getElementById('gallery-overlay');
  const galleryClose   = document.getElementById('gallery-close');
  const thumbs         = document.querySelectorAll('.gallery-thumb');
  const expanded       = document.getElementById('gallery-expanded');
  const expImg         = document.getElementById('exp-img');
  const expLabel       = document.getElementById('exp-label');

  let settingsOpen = false;
  let timerOn      = false;
  let filterIdx    = 0;
  let ratioIdx     = 0;
  let shooting     = false;
  let timerIv      = null;

  const filters = [
    { name:'Nenhum', css:'' },
    { name:'P&B',    css:'grayscale(1)' },
    { name:'Sépia',  css:'sepia(0.85)' },
    { name:'Frio',   css:'hue-rotate(195deg) saturate(1.2)' },
    { name:'Quente', css:'sepia(0.4) saturate(1.6) hue-rotate(-18deg)' },
  ];
  const ratios = [
    { label:'1×',   scale:1.00 },
    { label:'1.5×', scale:1.22 },
    { label:'2×',   scale:1.46 },
  ];

  /* ─────────────────────────────────────────
     GALERIA — abre automaticamente ao entrar
     na página pela primeira vez
  ───────────────────────────────────────── */
  const firstVisit = !sessionStorage.getItem('visited_' + PAGE);
  if (firstVisit && galleryOverlay) {
    sessionStorage.setItem('visited_' + PAGE, '1');
    // pequeno delay para a animação da câmera ter tempo de carregar
    setTimeout(() => galleryOverlay.classList.add('open'), 300);
  }

  if (galleryBtn && galleryOverlay) {
    galleryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      galleryOverlay.classList.add('open');
      if (expanded) expanded.classList.remove('show');
      thumbs.forEach(t => t.classList.remove('selected'));
      // marca o thumb do caso atual como selecionado
      const current = document.querySelector(`.gallery-thumb[data-page="caso${PAGE}.html"]`);
      if (current) current.classList.add('selected');
    });
  }

  if (galleryClose) {
    galleryClose.addEventListener('click', () => galleryOverlay.classList.remove('open'));
  }

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
      const src   = thumb.dataset.src;
      const label = thumb.dataset.label;
      const page  = thumb.dataset.page;
      if (expanded && expImg) {
        expImg.src = src;
        if (expLabel) expLabel.textContent = label;
        expanded.classList.add('show');
        expanded.onclick = () => { if (page) window.location.href = page; };
      }
    });
  });

  /* ─────────────────────────────────────────
     BOTÃO MODOS (☀) — apenas toggle visual.
     NÃO navega entre páginas.
  ───────────────────────────────────────── */
  if (btnModes) {
    let modesLit = (PAGE === '2' || PAGE === '3'); // aceso nos modos especiais
    if (modesLit) btnModes.classList.add('lit');
    btnModes.addEventListener('click', () => {
      modesLit = !modesLit;
      btnModes.classList.toggle('lit', modesLit);
    });
  }

  /* ── HD ── */
  if (btnHD) {
    let on = false;
    btnHD.addEventListener('click', () => { on = !on; btnHD.classList.toggle('lit', on); });
  }

  /* ── MUTE ── */
  if (btnMute) {
    let on = false;
    btnMute.addEventListener('click', () => { on = !on; btnMute.classList.toggle('lit', on); });
  }

  /* ── SETTINGS ── */
  function setSettings(val) {
    settingsOpen = val;
    if (floatSet) floatSet.classList.toggle('open', val);
    if (btnGear)  btnGear.classList.toggle('lit', val);
  }

  if (btnGear) {
    btnGear.addEventListener('click', (e) => { e.stopPropagation(); setSettings(!settingsOpen); });
  }
  document.addEventListener('click', (e) => {
    if (!settingsOpen) return;
    const inside = floatSet && floatSet.contains(e.target);
    const isGear = btnGear && (e.target === btnGear || btnGear.contains(e.target));
    if (!inside && !isGear) setSettings(false);
  });

  /* ── TIMER ── */
  if (fbTimer) {
    fbTimer.addEventListener('click', (e) => {
      e.stopPropagation();
      timerOn = !timerOn;
      if (fvTimer) fvTimer.textContent = timerOn ? '3s' : 'Off';
      fbTimer.classList.toggle('on', timerOn);
    });
  }

  /* ── FILTRO ── */
  if (fbFiltro) {
    fbFiltro.addEventListener('click', (e) => {
      e.stopPropagation();
      filterIdx = (filterIdx + 1) % filters.length;
      const f = filters[filterIdx];
      if (fvFiltro) fvFiltro.textContent = f.name;
      if (vfInner)  vfInner.style.filter = f.css;
      fbFiltro.classList.toggle('on', filterIdx > 0);
    });
  }

  /* ── ZOOM ── */
  if (fbRatio) {
    fbRatio.addEventListener('click', (e) => {
      e.stopPropagation();
      ratioIdx = (ratioIdx + 1) % ratios.length;
      const r = ratios[ratioIdx];
      if (fvRatio) fvRatio.textContent = r.label;
      if (vfInner) vfInner.style.transform = `scale(${r.scale})`;
      fbRatio.classList.toggle('on', ratioIdx > 0);
      if (rToast) {
        rToast.textContent = '🔍 ' + r.label;
        rToast.classList.add('show');
        clearTimeout(rToast._t);
        rToast._t = setTimeout(() => rToast.classList.remove('show'), 1800);
      }
    });
  }

  /* ── SHUTTER ── */
  if (shutter) {
    shutter.addEventListener('click', () => {
      if (shooting) return;
      timerOn ? startTimer() : doFlash();
    });
  }

  function startTimer() {
    if (timerIv) { clearInterval(timerIv); timerIv = null; }
    shooting = true;
    let n = 3;
    if (timerOv) { timerOv.textContent = n; timerOv.classList.add('show'); }
    timerIv = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(timerIv); timerIv = null;
        if (timerOv) timerOv.classList.remove('show');
        shooting = false;
        doFlash();
      } else {
        if (timerOv) timerOv.textContent = n;
      }
    }, 1000);
  }

  function doFlash() {
    if (!flash) return;
    flash.style.opacity = '1';
    setTimeout(() => { flash.style.opacity = '0'; }, 110);
  }

});