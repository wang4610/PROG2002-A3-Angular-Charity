export function showToast(type, message, duration = 3200) {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toastEl = document.createElement("div");
    toastEl.className = `toast ${type}`;
    toastEl.innerText = message;
    container.appendChild(toastEl);
    setTimeout(() => toastEl.classList.add("show"), 10);
    setTimeout(() => {
        toastEl.classList.remove("show");
        setTimeout(() => toastEl.remove(), 360);
    }, duration);
}
export function initBackToTop() {
    const btn = document.querySelector("#backToTop");
    if (!btn) return;
    window.addEventListener("scroll", () => {
        if (window.scrollY > 420) {
            btn.classList.add("visible");
        } else {
            btn.classList.remove("visible");
        }
    });
    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
export function initScrollFade(cardSelector = ".event-card") {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll(cardSelector).forEach(card => observer.observe(card));
}
export function initNavbarScroll() {
    const nav = document.querySelector(".main-nav");
    if (!nav) return;
    window.addEventListener("scroll", () => {
        if (window.scrollY > 60) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    });
}
export function initHamburgerMenu() {
    const hamburger = document.querySelector("#hamburgerBtn");
    const menu = document.querySelector("#navMenu");
    if (!hamburger || !menu) return;
    hamburger.addEventListener("click", () => {
        menu.classList.toggle("open");
    });
}
export function initLightbox() {
    let overlay = document.querySelector(".lightbox-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "lightbox-overlay";
        overlay.innerHTML = `
            <button class="lightbox-close">×</button>
            <img class="lightbox-img" alt="preview">
        `;
        document.body.appendChild(overlay);
    }
    const imgEl = overlay.querySelector(".lightbox-img");
    const closeBtn = overlay.querySelector(".lightbox-close");
    function openLightbox(src) {
        imgEl.src = src;
        overlay.style.display = "flex";
    }
    function closeLightbox() {
        overlay.style.display = "none";
        imgEl.src = "";
    }
    document.querySelectorAll("[data-lightbox]").forEach(img => {
        img.style.cursor = "pointer";
        img.addEventListener("click", () => openLightbox(img.src));
    });
    closeBtn.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });
}
export function generateSkeletonCards(count = 6) {
    let html = "";
    for (let i = 0; i < count; i++) {
        html += `
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
            </div>
        </div>
        `;
    }
    return html;
}
export function generateSkeletonDetail() {
    return `
    <div class="skeleton-detail">
        <div class="skeleton-detail-img"></div>
        <div class="skeleton-detail-body">
            <div class="skeleton-line" style="width:60%; height:22px;"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
        </div>
    </div>
    `;
}
export function setBreadcrumb(items) {
    const bc = document.querySelector(".breadcrumb");
    if (!bc) return;
    let html = "";
    items.forEach((item, idx) => {
        if (item.link) {
            html += `<a href="${item.link}">${item.text}</a>`;
        } else {
            html += `<span>${item.text}</span>`;
        }
        if (idx !== items.length - 1) {
            html += `<span class="sep">/</span>`;
        }
    });
    bc.innerHTML = html;
}
export function initGlobalEscModal(modalSelector) {
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modal = document.querySelector(modalSelector);
            if (modal) modal.style.display = "none";
        }
    });
}

// 修复后的animateCounter，增加空值判断，不会崩溃阻断后续代码
export function animateCounter(element, target, duration = 1400) {
    // 保护：target为空或者不是数字直接退出，不执行动画，防止报错
    if(target === null || target === undefined || isNaN(Number(target))){
        return;
    }
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    function updateCounter() {
        current += increment;
        if (current < target) {
            element.innerText = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.innerText = target.toLocaleString();
        }
    }
    updateCounter();
}
