/* i18n.js: تحميل الترجمات وتطبيقها + تبديل الاتجاه والخط */
const i18n = (function(){
  const storeKey = 'lang';
  let cache = { ar: null, en: null };
  let current = localStorage.getItem(storeKey) || 'ar';

  function setAttrsForLang(lang){
    const html = document.documentElement;
    html.lang = lang;
    html.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-en', lang === 'en');
    document.body.classList.toggle('lang-ar', lang === 'ar');
  }

  async function load(lang){
    if (cache[lang]) return cache[lang];
    const res = await fetch(`assets/i18n/${lang}.json`, { cache: 'no-store' });
    const json = await res.json();
    cache[lang] = json;
    return json;
  }

  function t(key){
    const dict = cache[current] || {};
    // يدعم مفاتيح متداخلة a.b.c
    return key.split('.').reduce((acc,k)=> (acc && acc[k] != null) ? acc[k] : null, dict) || '';
  }

  async function applyTranslations(){
    setAttrsForLang(current);
    const dict = await load(current);
    const nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach(node=>{
      const key = node.getAttribute('data-i18n');
      const val = key.split('.').reduce((acc,k)=> (acc && acc[k]!=null)? acc[k] : null, dict);
      if (val != null){
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA'){
          node.setAttribute('placeholder', val);
        } else {
          node.textContent = val;
        }
      }
    });
  }

  function setLanguage(lang){
    current = (lang === 'en') ? 'en' : 'ar';
    localStorage.setItem(storeKey, current);
    applyTranslations();
  }

  function getLanguage(){ return current; }

  // تهيئة أولية
  setAttrsForLang(current);

  return { setLanguage, getLanguage, applyTranslations, t };
})();
