/* main.js: سلوكيات عامة (Navbar, Mobile menu, سنة الحقوق, تبديل اللغة, إرسال النموذج) */
(function(){
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const langSwitcher = document.getElementById('langSwitcher');
  const mobileLang = document.getElementById('mobileLang');

  // تبديل نمط النافبار عند التمرير (شفاف -> صلب)
  let lastY = 0;
  window.addEventListener('scroll', utils.debounce(() => {
    const y = window.scrollY || window.pageYOffset;
    if (!header) return;
    if (y > 10 && header.classList.contains('transparent')) {
      header.classList.remove('transparent');
      header.classList.add('solid');
    } else if (y <= 10 && !document.body.classList.contains('internal')) {
      header.classList.add('transparent');
      header.classList.remove('solid');
    }
    lastY = y;
  }, 50));

  // قائمة الموبايل
  if (menuToggle && mobileMenu){
    menuToggle.addEventListener('click', () => {
      const isHidden = mobileMenu.hasAttribute('hidden');
      if (isHidden) mobileMenu.removeAttribute('hidden'); else mobileMenu.setAttribute('hidden', '');
    });
  }

  // سنة الحقوق
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // تبديل اللغة
  function toggleLang(){
    const next = (i18n.getLanguage() === 'ar') ? 'en' : 'ar';
    i18n.setLanguage(next);
    // تحديث زر اللغة
    const label = (next === 'ar') ? 'EN' : 'AR';
    if (langSwitcher) langSwitcher.textContent = label;
    if (mobileLang) mobileLang.textContent = label;
  }
  if (langSwitcher) langSwitcher.addEventListener('click', toggleLang);
  if (mobileLang) mobileLang.addEventListener('click', toggleLang);

  // تهيئة النصوص بحسب اللغة المحفوظة
  document.addEventListener('DOMContentLoaded', () => {
    i18n.applyTranslations();
    const current = i18n.getLanguage();
    if (langSwitcher) langSwitcher.textContent = (current === 'ar') ? 'EN' : 'AR';
    if (mobileLang) mobileLang.textContent = (current === 'ar') ? 'EN' : 'AR';
  });

  // معالجة نموذج التواصل (Formspree أو EmailJS)
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // بدء مؤقت مكافحة السبام (≥ 2s)
    utils.initHoneypotTiming();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('formStatus');
      const t = (k)=> i18n.t(k);

      // حقل honeypot
      const hp = form.querySelector('input[name="website"]');
      if (hp && hp.value.trim() !== '') {
        status.textContent = t('contact.spam_detected') || 'تم رصد سبام.';
        return;
      }
      // مهلة ≥ 2s
      if (!utils.canSubmitAfterDelay(2000)) {
        status.textContent = t('contact.too_fast') || 'تم إرسال الطلب بسرعة كبيرة. الرجاء المحاولة مجددًا.';
        return;
      }
      // تحقق البريد
      const email = form.querySelector('#email')?.value?.trim() || '';
      if (!utils.validateEmail(email)){
        status.textContent = t('contact.invalid_email') || 'الرجاء إدخال بريد صحيح.';
        return;
      }

      status.textContent = t('contact.sending') || 'جارٍ الإرسال...';

      const provider = form.getAttribute('data-provider') || 'formspree';
      try{
        if (provider === 'formspree') {
          // إرسال Formspree (بدون مكتبات خارجية)
          const data = new FormData(form);
          const res = await fetch(form.getAttribute('action'), {
            method: form.getAttribute('method') || 'POST',
            headers: { 'Accept': 'application/json' },
            body: data
          });
          if (res.ok) {
            status.textContent = t('contact.success') || 'تم الإرسال بنجاح، سنعود إليك قريبًا.';
            form.reset();
          } else {
            status.textContent = t('contact.fail') || 'تعذر الإرسال. حاول لاحقًا.';
          }
        } else if (provider === 'emailjs') {
          // EmailJS (اختياري): أدخل بياناتك هنا
          // 1) أضف سكربت EmailJS في <head> إن رغبت (غير مطلوب هنا وفق القيود)
          // 2) استبدل القيم أدناه بقيمك من EmailJS
          const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
          const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
          const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

          // لإرسال بدون مكتبة، يمكن استخدام endpoint EmailJS REST (إن توفر)؛
          // لكن غالبًا يتطلب تضمين sdk. لذا نتركه كتعليمات في README.
          status.textContent = t('contact.emailjs_note') || 'لإرسال عبر EmailJS، راجع README لتفعيل SDK.';
        }
      }catch(err){
        console.error(err);
        status.textContent = t('contact.fail') || 'تعذر الإرسال. حاول لاحقًا.';
      }
    });
  });
})();
