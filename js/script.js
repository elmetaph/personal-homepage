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
