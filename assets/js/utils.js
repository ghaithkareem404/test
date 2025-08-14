/* utils.js: دوال مساعدة */
const utils = (function(){
  // debounce: لمنع الاستدعاءات الكثيرة أثناء التمرير أو تغيير الحجم
  function debounce(fn, wait){
    let t;
    return function(...args){
      clearTimeout(t);
      t = setTimeout(()=> fn.apply(this, args), wait);
    };
  }

  // تحقق البريد (بسيط وصولي)
  function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  // مؤقت مكافحة السبام
  let startTime = Date.now();
  function initHoneypotTiming(){
    startTime = Date.now();
  }
  function canSubmitAfterDelay(ms){
    return (Date.now() - startTime) >= ms;
  }

  return { debounce, validateEmail, initHoneypotTiming, canSubmitAfterDelay };
})();
