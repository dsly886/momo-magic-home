/* ===== momo的AI魔法屋 - 通用工具函数 ===== */

const MagicUtils = {
  // === 星空背景 ===
  createStarryBg(container) {
    const starCount = 150;
    const fragment = document.createDocumentFragment();

    // Create stars
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      const size = Math.random() > 0.9 ? 'star-large' : Math.random() > 0.6 ? 'star-medium' : 'star-small';
      star.className = `star ${size}`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--duration', `${2 + Math.random() * 4}s`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      fragment.appendChild(star);
    }

    // Shooting stars
    for (let i = 0; i < 3; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.className = 'shooting-star';
      shootingStar.style.left = `${70 + Math.random() * 30}%`;
      shootingStar.style.top = `${Math.random() * 30}%`;
      shootingStar.style.animationDuration = `${1.5 + Math.random() * 1}s`;
      shootingStar.style.animationDelay = `${5 + Math.random() * 15}s`;
      fragment.appendChild(shootingStar);
    }

    // Nebulae
    const nebula1 = document.createElement('div');
    nebula1.className = 'nebula nebula-1';
    const nebula2 = document.createElement('div');
    nebula2.className = 'nebula nebula-2';
    const nebula3 = document.createElement('div');
    nebula3.className = 'nebula nebula-3';
    fragment.appendChild(nebula1);
    fragment.appendChild(nebula2);
    fragment.appendChild(nebula3);

    container.appendChild(fragment);
  },

  // === 魔法粒子效果 ===
  spawnParticles(x, y, count = 12) {
    const emojis = ['✨', '⭐', '💫', '🌟', '🪄', '🔮'];
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.left = `${x + (Math.random() - 0.5) * 60}px`;
      particle.style.top = `${y + (Math.random() - 0.5) * 60}px`;
      particle.style.fontSize = `${14 + Math.random() * 18}px`;
      particle.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 3000);
    }
  },

  // === Typewriter 打字机效果 ===
  typewriter(element, text, speed = 30, callback) {
    element.innerHTML = '';
    element.style.display = 'block';
    element.classList.add('show');

    const chars = text.split('');
    let index = 0;

    function addChar() {
      if (index >= chars.length) {
        if (callback) callback();
        return;
      }

      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = chars[index];
      // Stagger the animation
      charSpan.style.animationDelay = '0s';
      element.appendChild(charSpan);

      index++;
      setTimeout(addChar, speed);
    }

    addChar();
  },

  // === Toast 提示 ===
  showToast(message, duration = 2500) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },

  // === 复制到剪贴板 ===
  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(i18n?.t?.('common.copied') || '✨ Copied to clipboard');
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  },

  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.showToast(i18n?.t?.('common.copied') || '✨ Copied to clipboard');
  },

  // === 工具通用初始化 ===
  initToolPage(options) {
    const {
      title,
      formId = 'magic-form',
      inputIds = [],
      submitBtnId = 'submit-btn',
      resultBoxId = 'result-box',
      loadingId = 'loading',
      apiMethod,
      glowColor = 'purple',
    } = options;

    // Starry background
    const container = document.getElementById('stars-container');
    if (container) this.createStarryBg(container);

    // Form submit
    const form = document.getElementById(formId);
    const submitBtn = document.getElementById(submitBtnId);
    const resultBox = document.getElementById(resultBoxId);
    const loading = document.getElementById(loadingId);
    const resultContent = resultBox ? resultBox.querySelector('.result-content') : null;
    const placeholder = resultBox ? resultBox.querySelector('.result-placeholder') : null;
    const copyBtn = resultBox ? resultBox.querySelector('.btn-copy') : null;

    if (form && submitBtn && apiMethod) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!MagicAPI.hasApiKey()) {
          this.showToast('请在设置中配置 DeepSeek API Key（本地开发模式需要）🔑');
          return;
        }

        const inputs = {};
        inputIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) inputs[id] = el.value.trim();
        });

        // Check required inputs
        if (Object.values(inputs).some(v => !v)) {
          this.showToast(i18n?.t?.('common.fill_all_fields') || 'Please fill in all fields ✨');
          return;
        }

        // --- 显示结果框，隐藏占位，显示加载中 ---
        if (placeholder) placeholder.style.display = 'none';
        if (resultContent) {
          resultContent.style.display = 'block';
          resultContent.innerHTML = '<div style="text-align:center;padding:20px;"><div class="magic-spinner" style="margin:0 auto 12px;"></div><div style="color:var(--color-text-dim);">✨ Casting spell...</div></div>';
        }
        if (copyBtn) copyBtn.style.display = 'none';
        if (resultBox) resultBox.className = `result-box glow-${glowColor} is-loading`;
        if (loading) loading.style.display = 'none';

        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = '✨ Casting spell...';

        try {
          console.log('[momo魔法屋] 开始调用 API...');
          const result = await apiMethod(...Object.values(inputs));
          console.log('[momo魔法屋] API 返回成功, 内容长度:', result?.length);

          // Display result with typewriter
          if (resultContent && resultBox) {
            resultContent.innerHTML = '';
            resultBox.className = `result-box glow-${glowColor} has-result`;
            this.typewriter(resultContent, result, 25);
          }

          // Show copy button
          if (copyBtn) copyBtn.style.display = 'inline-flex';

          // Spawn particles on the button
          const rect = submitBtn.getBoundingClientRect();
          this.spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

        } catch (err) {
          console.error('[momo魔法屋] 错误:', err);
          if (resultContent && resultBox) {
            resultContent.innerHTML = `<div style="color:#f87171;text-align:center;padding:20px;line-height:2;">
              <div style="font-size:32px;margin-bottom:8px;">⚠️</div>
              <div>${err.message}</div>
              <div style="font-size:13px;color:var(--color-text-dim);margin-top:12px;">
                ${i18n?.t?.('common.error_check_console') || 'Check the console (F12) for error details'}
              </div>
            </div>`;
            resultBox.className = `result-box glow-${glowColor} has-error`;
          }
          this.showToast('❌ ' + err.message);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = '✨ Cast Magic';
        }
      });
    }

    return {
      form,
      submitBtn,
      resultBox,
      loading,
    };
  },
};
