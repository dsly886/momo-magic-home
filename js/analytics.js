/* ===== Vercel Web Analytics ===== */
(function () {
  if (typeof window === 'undefined') return;

  // 初始化 va 队列
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  // 开发环境使用 debug 脚本
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  script.dataset.sdkn = '@vercel/analytics/vanilla';
  script.dataset.sdkv = '2.0.1';

  script.onerror = function () {
    console.log('[Vercel Analytics] Failed to load. Ensure Web Analytics is enabled in your Vercel project settings.');
  };

  document.head.appendChild(script);
})();
