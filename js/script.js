document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const reveals = document.querySelectorAll(".reveal");

  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add("is-visible"));
  }

  // V2 keeps the six cards as static UI; keyboard focus is supported.
  document.querySelectorAll(".entry-card").forEach((card) => {
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("is-selected");
      }
    });
  });
});

/* V2.1 — stronger magnetic hero art + interactive Yan placeholder */
(() => {
  const art = document.querySelector('.hero-art');
  if (art) {
    const shapes = [...art.querySelectorAll('.shape')];
    const strengths = [0.85, 1.0, 0.72, 1.15];
    let raf = null;
    let pointer = { x: 0, y: 0 };
    let active = false;

    const reset = () => {
      art.classList.remove('magnetic-active');
      art.style.transform = '';
      shapes.forEach(shape => {
        shape.style.setProperty('--mx', '0px');
        shape.style.setProperty('--my', '0px');
        shape.style.setProperty('--mr', '0deg');
      });
      active = false;
    };

    const update = () => {
      raf = null;
      const r = art.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = pointer.x - cx;
      const dy = pointer.y - cy;
      const distance = Math.hypot(dx, dy);

      // About 1.5× the previous magnetic field.
      const radius = Math.max(r.width, r.height) * 1.42;
      if (distance > radius) {
        if (active) reset();
        return;
      }

      active = true;
      art.classList.add('magnetic-active');
      const influence = Math.pow(Math.max(0, 1 - distance / radius), 0.72);
      const angle = Math.atan2(dy, dx);
      const maxMove = 32;

      art.style.transform = `translate3d(${(Math.cos(angle) * maxMove * influence * .16).toFixed(2)}px, ${(Math.sin(angle) * maxMove * influence * .16).toFixed(2)}px, 0)`;

      shapes.forEach((shape, i) => {
        const move = maxMove * strengths[i] * influence;
        const x = Math.cos(angle) * move;
        const y = Math.sin(angle) * move;
        const rotate = (dx / radius) * (3 + i * .8) * influence;
        shape.style.setProperty('--mx', `${x.toFixed(2)}px`);
        shape.style.setProperty('--my', `${y.toFixed(2)}px`);
        shape.style.setProperty('--mr', `${rotate.toFixed(2)}deg`);
      });
    };

    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('blur', reset);
  }

  const avatar = document.querySelector('.avatar');
  if (avatar) {
    let raf = null;
    let pointer = { x: 0, y: 0 };

    const updateAvatar = () => {
      raf = null;
      const r = avatar.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (pointer.x - r.left) / r.width));
      const y = Math.max(0, Math.min(1, (pointer.y - r.top) / r.height));
      avatar.style.setProperty('--avatar-rx', `${((.5 - y) * 10).toFixed(2)}deg`);
      avatar.style.setProperty('--avatar-ry', `${((x - .5) * 10).toFixed(2)}deg`);
      avatar.style.setProperty('--avatar-x', `${((x - .5) * 7).toFixed(2)}px`);
      avatar.style.setProperty('--avatar-y', `${((y - .5) * 7).toFixed(2)}px`);
    };

    avatar.addEventListener('pointerenter', () => avatar.classList.add('is-tilting'));
    avatar.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!raf) raf = requestAnimationFrame(updateAvatar);
    }, { passive: true });
    avatar.addEventListener('pointerleave', () => {
      avatar.classList.remove('is-tilting');
      avatar.style.setProperty('--avatar-rx', '0deg');
      avatar.style.setProperty('--avatar-ry', '0deg');
      avatar.style.setProperty('--avatar-x', '0px');
      avatar.style.setProperty('--avatar-y', '0px');
    });
  }
})();


/* V2.1 — stronger magnetic hero art + interactive Yan placeholder */
(() => {
  const heroArt = document.querySelector('.hero-art');

  if (heroArt) {
    const shapes = [...heroArt.querySelectorAll('.shape')];
    const strengths = [1.00, 0.90, 1.15, 0.98];

    let raf = null;
    let mouseX = 0;
    let mouseY = 0;

    const reset = () => {
      heroArt.classList.remove('magnetic-active');
      heroArt.style.transform = '';
      shapes.forEach(shape => shape.style.transform = '');
    };

    const animate = () => {
      raf = null;
      const rect = heroArt.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const distance = Math.hypot(dx, dy);

      // 1.5x+ larger magnetic field.
      const radius = Math.max(rect.width, rect.height) * 1.5;

      if (distance > radius) {
        reset();
        return;
      }

      heroArt.classList.add('magnetic-active');

      // Strong response that is still smooth.
      const influence = Math.pow(Math.max(0, 1 - distance / radius), 0.62);
      const angle = Math.atan2(dy, dx);

      // The whole group follows a little; each piece follows much more.
      const groupMove = 12 * influence;
      heroArt.style.transform =
        `translate3d(${(Math.cos(angle)*groupMove).toFixed(2)}px, ${(Math.sin(angle)*groupMove).toFixed(2)}px, 0)`;

      shapes.forEach((shape, i) => {
        const move = 48 * (strengths[i] || 1) * influence;
        const x = Math.cos(angle) * move;
        const y = Math.sin(angle) * move;
        const rotate = (dx / radius) * (5 + i * 0.7) * influence;

        shape.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg)`;
      });
    };

    // Listen on the parent hero section so the magnetic field extends
    // beyond the visible artwork itself.
    const area = heroArt.closest('.hero') || heroArt.parentElement || heroArt;

    area.addEventListener('pointermove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!raf) raf = requestAnimationFrame(animate);
    });

    area.addEventListener('pointerleave', reset);
  }

  // Support either class name used by the V2.1 variants.
  const avatar = document.querySelector('.avatar, .avatar-placeholder');

  if (avatar) {
    let raf = null;
    let mouseX = 0;
    let mouseY = 0;

    const animateAvatar = () => {
      raf = null;
      const rect = avatar.getBoundingClientRect();
      const px = (mouseX - rect.left) / rect.width;
      const py = (mouseY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 14;
      const rotateX = -(py - 0.5) * 14;
      const shiftX = (px - 0.5) * 9;
      const shiftY = (py - 0.5) * 9;

      avatar.style.setProperty('--avatar-rotate-x', `${rotateX.toFixed(2)}deg`);
      avatar.style.setProperty('--avatar-rotate-y', `${rotateY.toFixed(2)}deg`);
      avatar.style.setProperty('--avatar-shift-x', `${shiftX.toFixed(2)}px`);
      avatar.style.setProperty('--avatar-shift-y', `${shiftY.toFixed(2)}px`);
      avatar.style.boxShadow = '0 14px 28px rgba(0,0,0,.10)';
    };

    avatar.addEventListener('pointerenter', e => {
      avatar.classList.add('is-tilting');
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    avatar.addEventListener('pointermove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!raf) raf = requestAnimationFrame(animateAvatar);
    });

    avatar.addEventListener('pointerleave', () => {
      avatar.classList.remove('is-tilting');
      avatar.style.setProperty('--avatar-rotate-x', '0deg');
      avatar.style.setProperty('--avatar-rotate-y', '0deg');
      avatar.style.setProperty('--avatar-shift-x', '0px');
      avatar.style.setProperty('--avatar-shift-y', '0px');
      avatar.style.boxShadow = '';
    });
  }
})();
/* V3 — Supabase feedback */
(() => {
  // Only show the feedback feature on the homepage.
  const path = window.location.pathname;
  const isHomePage =
    path.endsWith("/") ||
    path.endsWith("/index.html") ||
    path === "";

  if (!isHomePage) return;

  const SUPABASE_URL = "https://dcmneceqanoydjiazezu.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_eIqDVwODTMDbkIIgt6Xg0g_61A60uHD";

  // Load Supabase client library.
  const loadSupabase = () =>
    new Promise((resolve, reject) => {
      if (window.supabase) {
        resolve(window.supabase);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = () => resolve(window.supabase);
      script.onerror = () => reject(new Error("Supabase library failed to load."));
      document.head.appendChild(script);
    });

  const injectStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      .v3-feedback-trigger {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 9000;
        border: 1px solid rgba(0,0,0,.12);
        background: rgba(255,255,255,.92);
        color: #222;
        padding: 11px 16px;
        border-radius: 999px;
        font: inherit;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,.10);
        backdrop-filter: blur(10px);
        transition: transform .2s ease, box-shadow .2s ease;
      }

      .v3-feedback-trigger:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0,0,0,.14);
      }

      .v3-feedback-overlay {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(20,20,20,.32);
        backdrop-filter: blur(5px);
      }

      .v3-feedback-overlay.is-open {
        display: flex;
      }

      .v3-feedback-modal {
        width: min(520px, 100%);
        max-height: min(720px, 90vh);
        overflow-y: auto;
        background: #fff;
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 24px 70px rgba(0,0,0,.20);
      }

      .v3-feedback-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
      }

      .v3-feedback-head h2 {
        margin: 0 0 6px;
        font-size: 26px;
      }

      .v3-feedback-head p {
        margin: 0;
        color: #666;
        line-height: 1.6;
      }

      .v3-feedback-close {
        border: 0;
        background: transparent;
        font-size: 24px;
        cursor: pointer;
        line-height: 1;
      }

      .v3-feedback-field {
        margin-bottom: 16px;
      }

      .v3-feedback-field label {
        display: block;
        margin-bottom: 7px;
        font-size: 14px;
        font-weight: 600;
      }

      .v3-feedback-field input,
      .v3-feedback-field select,
      .v3-feedback-field textarea {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 11px 13px;
        font: inherit;
        background: #fafafa;
        color: #222;
      }

      .v3-feedback-field textarea {
        min-height: 130px;
        resize: vertical;
      }

      .v3-feedback-field input:focus,
      .v3-feedback-field select:focus,
      .v3-feedback-field textarea:focus {
        outline: none;
        border-color: #999;
        background: #fff;
      }

      .v3-feedback-note {
        margin: 8px 0 18px;
        font-size: 13px;
        line-height: 1.6;
        color: #777;
      }

      .v3-feedback-submit {
        width: 100%;
        border: 0;
        border-radius: 12px;
        padding: 12px 16px;
        background: #222;
        color: #fff;
        font: inherit;
        cursor: pointer;
        transition: opacity .2s ease;
      }

      .v3-feedback-submit:disabled {
        cursor: wait;
        opacity: .55;
      }

      .v3-feedback-status {
        min-height: 22px;
        margin-top: 12px;
        font-size: 14px;
        line-height: 1.5;
      }

      @media (max-width: 600px) {
        .v3-feedback-trigger {
          right: 16px;
          bottom: 16px;
        }

        .v3-feedback-modal {
          padding: 22px;
          border-radius: 20px;
        }
      }
    `;

    document.head.appendChild(style);
  };

  const createFeedbackUI = () => {
    const trigger = document.createElement("button");
    trigger.className = "v3-feedback-trigger";
    trigger.style.display = "none";
    trigger.type = "button";
    trigger.textContent = "有想说的话";

    const overlay = document.createElement("div");
    overlay.className = "v3-feedback-overlay";
    overlay.innerHTML = `
      <div class="v3-feedback-modal" role="dialog" aria-modal="true">
        <div class="v3-feedback-head">
          <div>
            <h2>有想说的话</h2>
            <p>如果你愿意，可以告诉我网页哪里还可以改进。</p>
          </div>
          <button class="v3-feedback-close" type="button" aria-label="关闭">×</button>
        </div>

        <form class="v3-feedback-form">
          <div class="v3-feedback-field">
            <label for="v3-name">昵称（可选）</label>
            <input id="v3-name" name="name" type="text" maxlength="50">
          </div>

          <div class="v3-feedback-field">
            <label for="v3-relation">你和我的关系</label>
            <select id="v3-relation" name="relation">
              <option value="">请选择</option>
              <option value="朋友">朋友</option>
              <option value="同学">同学</option>
              <option value="老师">老师</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div class="v3-feedback-field">
            <label for="v3-device">你使用的设备</label>
            <select id="v3-device" name="device">
              <option value="">请选择</option>
              <option value="电脑">电脑</option>
              <option value="手机">手机</option>
              <option value="平板">平板</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div class="v3-feedback-field">
            <label for="v3-message">反馈内容 *</label>
            <textarea
              id="v3-message"
              name="message"
              required
              maxlength="1000"
              placeholder="比如：哪里看不懂、哪里不好找、哪里不方便……"
            ></textarea>
          </div>

          <p class="v3-feedback-note">
            这条反馈会保存到我的反馈后台，仅用于改进网页。
          </p>

          <button class="v3-feedback-submit" type="submit">
            提交反馈
          </button>

          <div class="v3-feedback-status" aria-live="polite"></div>
        </form>
      </div>
    `;

    document.body.appendChild(trigger);
    document.body.appendChild(overlay);

    return { trigger, overlay };
  };

  const initFeedback = async () => {
    injectStyles();

    const { trigger, overlay } = createFeedbackUI();
    const closeButton = overlay.querySelector(".v3-feedback-close");
    const form = overlay.querySelector(".v3-feedback-form");
    const submitButton = overlay.querySelector(".v3-feedback-submit");
    const status = overlay.querySelector(".v3-feedback-status");

    const open = () => {
      overlay.classList.add("is-open");
      overlay.querySelector("#v3-message")?.focus();
    };

    const close = () => {
      overlay.classList.remove("is-open");
    };

    trigger.addEventListener("click", open);

const contactTrigger = document.getElementById("feedback-trigger");
if (contactTrigger) {
  contactTrigger.addEventListener("click", open);
}

closeButton.addEventListener("click", close);

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) close();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") close();
});

    let supabaseClient = null;

    try {
      const supabaseLib = await loadSupabase();

      if (!supabaseLib?.createClient) {
        throw new Error("Supabase client is unavailable.");
      }

      supabaseClient = supabaseLib.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );
    } catch (error) {
      console.error(error);
      status.textContent = "反馈功能暂时无法连接，请稍后再试。";
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!supabaseClient) {
        status.textContent = "反馈功能暂时无法连接，请稍后再试。";
        return;
      }

      const formData = new FormData(form);

      const feedback = {
        name: String(formData.get("name") || "").trim() || null,
        relation: String(formData.get("relation") || "").trim() || null,
        device: String(formData.get("device") || "").trim() || null,
        message: String(formData.get("message") || "").trim(),
        version: "V3"
      };

      if (!feedback.message) {
        status.textContent = "请先填写反馈内容。";
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "正在提交…";
      status.textContent = "";

      try {
        const { error } = await supabaseClient
          .from("feedback")
          .insert([feedback]);

        if (error) throw error;

        status.textContent = "反馈已提交，谢谢你！";
        form.reset();
        submitButton.textContent = "提交成功";

        setTimeout(() => {
          close();
          submitButton.disabled = false;
          submitButton.textContent = "提交反馈";
          status.textContent = "";
        }, 1400);
      } catch (error) {
        console.error(error);
        status.textContent =
          "提交失败，请检查网络后再试。你刚才填写的内容没有被清空。";
        submitButton.disabled = false;
        submitButton.textContent = "重新提交";
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFeedback);
  } else {
    initFeedback();
  }
})();