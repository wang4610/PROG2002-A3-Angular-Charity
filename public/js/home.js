import { fetchHomeEvents } from './api.js';
import {
    initScrollFade,
    initNavbarScroll,
    initHamburgerMenu,
    generateSkeletonCards,
    setBreadcrumb,
    initLightbox,
    initBackToTop,
    showToast,
    animateCounter
} from './ui-components.js';

const skeletonWrap = document.querySelector("#skeleton-wrap");
const gridEl = document.querySelector("#event-grid-home");

window.addEventListener("DOMContentLoaded", async ()=>{
    initNavbarScroll();
    initHamburgerMenu();
    initBackToTop();
    setBreadcrumb([{text:"Home"}]);

    skeletonWrap.innerHTML = generateSkeletonCards(6);

    //首页数字动画
    document.querySelectorAll(".stat-number").forEach(el=>{
        animateCounter(el);
    });

    try{
        const res = await fetchHomeEvents();
        skeletonWrap.innerHTML = "";
        if(!res.success || !res.data){
            gridEl.innerHTML = `<div class="error-msg">Failed to load events</div>`;
            return;
        }
        renderHomeEventCards(res.data);
        initLightbox();
        initScrollFade();
    }catch(err){
        skeletonWrap.innerHTML = "";
        gridEl.innerHTML = `<div class="error-msg">Error loading event data</div>`;
    }
});

//渲染首页活动卡片【重点修复：点击跳详情页event‑detail，不再跳search】
function renderHomeEventCards(eventList){
    gridEl.innerHTML = "";
    eventList.forEach(ev=>{
        const cardDom = document.createElement("div");
        cardDom.className = "event-card";
        cardDom.innerHTML = `
            <div class="event-card-img-wrap">
                <img src="${ev.event_image_url}" alt="${ev.event_name}" data-lightbox>
                <span class="event-card-badge ${ev.event_status}">${ev.event_status}</span>
            </div>
            <div class="event-card-body">
                <h4>${ev.event_name}</h4>
                <p class="event-card-meta">📅 ${new Date(ev.event_date).toLocaleDateString()}</p>
                <p class="event-card-meta">📍 ${ev.location}</p>
                <p class="event-card-desc">${ev.event_short_description}</p>
                <div class="event-card-footer">
                    <span class="event-price">${ev.ticket_price>0?"$"+ev.ticket_price:"FREE"}</span>
                    <button class="btn btn-primary btn-view-detail" data-id="${ev.event_id}">View Details</button>
                </div>
            </div>
        `;
        gridEl.appendChild(cardDom);
    });

    //绑定点击跳转详情
    document.querySelectorAll(".btn-view-detail").forEach(btn=>{
        btn.addEventListener("click",(e)=>{
            const eid = e.target.dataset.id;
            window.location.href = `./event-detail.html?eventId=${eid}`;
        })
    })
}
