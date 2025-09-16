/* Central NY Insurance Leads – main.js */
(function(){
  // ---------- Analytics helper (GTM/GA4 placeholder)
  window.dataLayer = window.dataLayer || [];
  function gtagPush(event, payload){ try { window.dataLayer.push({ event, ...payload }); } catch(e) {} }
  window.gtagPush = gtagPush; // optional global for other scripts

  // ---------- Query param helper
  function qp(name){ try{ return new URL(window.location.href).searchParams.get(name) || ''; }catch(e){ return ''; } }

  // ---------- Prefill hidden tracking fields
  const startTime = Date.now();
  function prefillHidden(){
    const hidden = {
      utm_source: qp('utm_source'),
      utm_medium: qp('utm_medium'),
      utm_campaign: qp('utm_campaign'),
      utm_term: qp('utm_term'),
      utm_content: qp('utm_content'),
      gclid: qp('gclid'),
      fbclid: qp('fbclid'),
      referrer: document.referrer || '',
      landing_path: location.pathname + location.search,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    };
    Object.entries(hidden).forEach(([k,v])=>{
      const el = document.getElementById(k);
      if(el) el.value = v;
    });
  }

  // ---------- Call Now helper (DNI providers will override href)
  function callNow(){
    const phoneEl = document.querySelector('#dni-phone');
    if(phoneEl) window.location.href = phoneEl.href;
  }
  window.callNow = callNow; // used by the secondary CTA button

  // ---------- Basic client-side validation & submit handling
  function initForm(){
    const form = document.getElementById('lead-form');
    if(!form) return;

    form.addEventListener('submit', (e) => {
      // time-on-page
      const topEl = document.getElementById('time_on_page_ms');
      if(topEl) topEl.value = String(Date.now() - startTime);

      // honeypot
      const hp = document.getElementById('company');
      if(hp && hp.value){ e.preventDefault(); return; }

      // required fields
      const name = (document.getElementById('name')||{}).value?.trim() || '';
      const phone = (document.getElementById('phone')||{}).value?.trim() || '';
      const email = (document.getElementById('email')||{}).value?.trim() || '';
      const zip = (document.getElementById('zip')||{}).value?.trim() || '';
      const biztype = (document.getElementById('biztype')||{}).value || '';
      const consent = (document.getElementById('consent')||{}).checked || false;

      const setErr = (id, show) => { const el = document.getElementById(id); if(el) el.style.display = show ? 'block' : 'none'; };
      const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      const zipOk = /^\d{5}$/.test(zip);

      setErr('err-name', !name);
      setErr('err-phone', phone.replace(/\D/g,'').length < 7);
      setErr('err-email', !emailOk);
      setErr('err-zip', !zipOk);
      setErr('err-biztype', !biztype);
      setErr('err-consent', !consent);

      const ok = name && (phone.replace(/\D/g,'').length >= 7) && emailOk && zipOk && biztype && consent;
      if(!ok){ e.preventDefault(); return; }

      // analytics event
      gtagPush('lead_form_submit', { category:'lead', label:'smb_liability', city:'Syracuse' });

      // KEEP default HTML form POST to your webhook (simplest, no CORS headaches)
      // If you want to AJAX it without leaving page, uncomment below and set your endpoint CORS to allow POST from your domain.
      /*
      e.preventDefault();
      const fd = new FormData(form);
      fetch(form.action, { method:'POST', body:fd, mode:'no-cors' })
        .then(()=>{
          const s = document.getElementById('success');
          if(s) s.classList.remove('hidden');
          form.reset();
        })
        .catch(()=> alert('There was a problem submitting your request. Please call us.'));
      */
    });
  }

  // ---------- Footer year
  function setYear(){ const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear(); }

  // ---------- Init on DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    prefillHidden();
    initForm();
    setYear();
  });
})();

