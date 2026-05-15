document.addEventListener('DOMContentLoaded', () => {

  const PAGE = document.body.dataset.page; // '1','2','3'

  const btnHD    = document.getElementById('btn-hd');
  const btnMute  = document.getElementById('btn-mute');
  const btnModes = document.getElementById('btn-modes');
  const btnGear  = document.getElementById('btn-gear');
  const floatSet = document.getElementById('float-settings');
  const shutter  = document.getElementById('shutter');
  const timerOv  = document.getElementById('timer-ov');
  const flash    = document.getElementById('flash');
  const vfInner  = document.getElementById('vf-inner');
  const rToast   = document.getElementById('ratio-toast');
  const bgImg    = document.getElementById('bg-img-main');

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

  let settingsOpen    = false;
  let timerOn         = false;
  let filterIdx       = 0;
  let ratioIdx        = 0;
  let shooting        = false;
  let timerIv         = null;
  let brightnessLevel = 5;
  let animRan         = false;

  const filters = [
    { name:'Nenhum', css:'' },
    { name:'P&B',    css:'grayscale(1)' },
    { name:'Sépia',  css:'sepia(0.85)' },
    { name:'Frio',   css:'hue-rotate(195deg) saturate(1.2)' },
    { name:'Quente', css:'sepia(0.4) saturate(1.6) hue-rotate(-18deg)' },
  ];
  const ratios = [
    { label:'1x',   scale:1.00 },
    { label:'1.5x', scale:1.22 },
    { label:'2x',   scale:1.46 },
  ];

  /* ─────────────────────────────────────────
     ANIMAÇÕES POR PÁGINA — definidas aqui,
     sempre disponíveis quando shared.js roda
  ───────────────────────────────────────── */
  function initCameraAnim() {
    if (animRan) return;
    animRan = true;

    if (PAGE === '1') {
      const box   = document.getElementById('det-doc');
      const badge = document.getElementById('mode-badge');
      const popup = document.getElementById('subject-popup');
      setTimeout(() => {
        if (box) box.classList.add('show');
        setTimeout(() => {
          if (badge) {
            badge.classList.add('show');
            setTimeout(() => badge.classList.remove('show'), 2200);
          }
          setTimeout(() => {
            if (popup) {
              popup.classList.add('show');
              setTimeout(() => popup.classList.remove('show'), 4000);
            }
          }, 400);
        }, 600);
      }, 800);
    }

    if (PAGE === '2') {
      const ids    = ['fb2','fb3','fb4','fb5'];
      const delays = [600, 900, 750, 1100];
      const badge  = document.getElementById('mode-badge');
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) setTimeout(() => el.classList.add('show'), delays[i]);
      });
      setTimeout(() => {
        if (badge) {
          badge.classList.add('show');
          setTimeout(() => badge.classList.remove('show'), 2800);
        }
      }, 1300);
    }

    if (PAGE === '3') {
      const badge  = document.getElementById('mode-badge');
      const darkOv = document.getElementById('dark-ov');
      setTimeout(() => {
        if (badge) {
          badge.classList.add('show');
          setTimeout(() => badge.classList.remove('show'), 2800);
        }
      }, 400);
      setTimeout(() => {
        if (darkOv) darkOv.style.opacity = '0.55';
      }, 600);
    }
  }

  /* ─────────────────────────────────────────
     GALERIA
  ───────────────────────────────────────── */
  function abrirPreview(thumb) {
    if (!thumb || !expanded || !expImg) return;
    thumbs.forEach(t => t.classList.remove('selected'));
    thumb.classList.add('selected');
    expImg.src = thumb.dataset.src;
    expImg.style.objectPosition = thumb.dataset.objpos || 'center';
    if (expLabel) expLabel.textContent = thumb.dataset.label;
    expanded.classList.add('show');
    expanded.onclick = () => {
      const page = thumb.dataset.page;
      if (page) window.location.href = page + '?from=gallery';
    };
  }

  if (galleryOverlay) {
    const fromGallery = new URLSearchParams(window.location.search).get('from') === 'gallery';
    if (fromGallery) {
      // veio da prévia — mostra câmera direto, sem galeria
      galleryOverlay.classList.remove('open');
      initCameraAnim();
    } else {
      // entrada direta — abre galeria como home
      galleryOverlay.classList.add('open');
      const cur = document.querySelector(`.gallery-thumb[data-page="caso${PAGE}.html"]`);
      if (cur) abrirPreview(cur);
    }
  }

  if (galleryBtn) {
    galleryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      animRan = false; // permite reanimar ao sair de novo
      if (expanded) expanded.classList.remove('show');
      galleryOverlay.classList.add('open');
      const cur = document.querySelector(`.gallery-thumb[data-page="caso${PAGE}.html"]`);
      if (cur) abrirPreview(cur);
    });
  }

  if (galleryClose) {
    galleryClose.addEventListener('click', () => {
      galleryOverlay.classList.remove('open');
      initCameraAnim();
    });
  }

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => abrirPreview(thumb));
  });

  /* ── BOTÃO ☀ ── */
  if (btnModes) {
    if (PAGE === '2' || PAGE === '3') btnModes.classList.add('lit');

    if (PAGE === '3') {
      btnModes.addEventListener('click', () => {
        brightnessLevel++;
        if (brightnessLevel > 9) brightnessLevel = 1;
        const bv = 0.3 + (brightnessLevel - 1) * (1.5 / 8);
        if (bgImg) bgImg.style.filter = `brightness(${bv.toFixed(2)})`;
        showBrightnessToast(brightnessLevel);
        btnModes.classList.toggle('lit', brightnessLevel > 1);
      });
    } else {
      let lit = PAGE !== '1';
      btnModes.addEventListener('click', () => {
        lit = !lit;
        btnModes.classList.toggle('lit', lit);
      });
    }
  }

  function showBrightnessToast(level) {
    let toast = document.getElementById('brightness-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'brightness-toast';
      toast.style.cssText = `position:absolute;bottom:20px;left:50%;
        transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#f5a623;
        font-size:13px;font-weight:700;padding:6px 16px;border-radius:14px;
        z-index:60;white-space:nowrap;pointer-events:none;transition:opacity 0.3s;`;
      document.querySelector('.viewfinder').appendChild(toast);
    }
    const icons = ['🌑','🌒','🌓','🌔','🌕','🌖','☀️','🌟','✨'];
    toast.textContent = `Exposicao ${icons[level-1]} ${level}/9`;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 1800);
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
      if (PAGE === '3' && bgImg) {
        const bv = 0.3 + (brightnessLevel - 1) * (1.5 / 8);
        bgImg.style.filter = `brightness(${bv.toFixed(2)}) ${f.css}`;
      } else if (vfInner) {
        vfInner.style.filter = f.css;
      }
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