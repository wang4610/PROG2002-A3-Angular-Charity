import { fetchSingleEvent } from './api.js';
import {
    initNavbarScroll, initHamburgerMenu, setBreadcrumb, initLightbox,
    initBackToTop, initGlobalEscModal, showToast, generateSkeletonDetail
} from './ui-components.js';

const loadingEl = document.querySelector("#detail-loading");
const skeletonWrap = document.querySelector("#skeleton-detail-wrap");
const contentEl = document.querySelector("#detail-content");
const modalOverlay = document.querySelector("#register-modal");
const modalCloseBtn = document.querySelector("#modal-close-btn");
const breadcrumbTitle = document.querySelector("#detail-breadcrumb-title");

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('eventId');

window.addEventListener("DOMContentLoaded", async () => {
    initNavbarScroll();
    initHamburgerMenu();
    initBackToTop();
    initGlobalEscModal("#register-modal");

    skeletonWrap.innerHTML = generateSkeletonDetail();

    if (!eventId) {
        loadingEl.style.display = 'none';
        skeletonWrap.innerHTML = "";
        contentEl.innerHTML = `<div class="error-msg">Missing event ID parameter. Go back home page and select event.</div>`;
        setBreadcrumb([
            { text: "Home", link: "./index.html" },
            { text: "Event Detail (Invalid)" }
        ]);
        return;
    }

    try {
        const resp = await fetchSingleEvent(eventId);
        loadingEl.style.display = 'none';
        skeletonWrap.innerHTML = "";

        if (!resp.success) {
            contentEl.innerHTML = `<div class="error-msg">${resp.message ?? "Cannot retrieve this event record."}</div>`;
            setBreadcrumb([
                { text: "Home", link: "./index.html" },
                { text: "Event Not Found" }
            ]);
            return;
        }
        renderDetail(resp.data);
        initLightbox();
    } catch (err) {
        loadingEl.style.display = 'none';
        skeletonWrap.innerHTML = "";
        contentEl.innerHTML = `<div class="error-msg">API connection error. Confirm backend server is running on localhost:3001.</div>`;
        showToast("error", "Failed fetch event data");
    }

    modalCloseBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
    });
});

function renderDetail(ev) {
    const badge = ev.event_status === 'upcoming'
        ? `<span class="badge-upcoming">Upcoming Event</span>`
        : `<span class="badge-past">Past Event</span>`;

    if (breadcrumbTitle) breadcrumbTitle.innerText = ev.event_name;
    setBreadcrumb([
        { text: "Home", link: "./index.html" },
        { text: "Search", link: "./search.html" },
        { text: ev.event_name }
    ]);

    const html = `
    <div class="detail-container">
        <div class="detail-hero">
            <img class="detail-hero-img" src="${ev.event_image_url}" alt="${ev.event_name}" data-lightbox>
            <div class="detail-hero-badge">
                ${badge}
                <span class="event-category-tag">${ev.cat_name}</span>
            </div>
        </div>
        <div class="detail-body">
            <div class="detail-title-row">
                <h1>${ev.event_name}</h1>
                <span class="price-tag">${ev.ticket_price>0?"AUD $"+ev.ticket_price.toFixed(2):"FREE Entry"}</span>
            </div>
            <p class="detail-lead"><strong>Host Organisation:</strong> ${ev.org_name}</p>
            <hr>
            <div class="detail-grid">
                <div class="meta-box">
                    <h4>📅 Date & Time</h4>
                    <p>${new Date(ev.event_date).toLocaleString()}</p>
                </div>
                <div class="meta-box">
                    <h4>📍 Location</h4>
                    <p>${ev.location}</p>
                </div>
                <div class="meta-box">
                    <h4>🎟 Ticket</h4>
                    <p>${ev.ticket_price>0?"$"+ev.ticket_price.toFixed(2):"Free, donations welcome"}</p>
                </div>
                <div class="meta-box">
                    <h4>📂 Category</h4>
                    <p>${ev.cat_name}</p>
                </div>
            </div>

            <div class="progress-card">
                <h4>🎯 Fundraising Progress</h4>
                <div class="progress-stats">
                    <span>Goal: $${ev.charity_goal_amount.toFixed(2)}</span>
                    <span>Raised: $${ev.current_raised.toFixed(2)} (${ev.progress_percent}%)</span>
                </div>
                <div class="progress-wrap">
                    <div class="progress-bar" style="width:${ev.progress_percent}%"></div>
                </div>
            </div>

            <h3>Full Event Description</h3>
            <p style="margin-top:0.6rem;">${ev.event_full_description}</p>

            <h3>Organisation Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <p>Mission</p>
                    <p>${ev.mission}</p>
                </div>
                <div class="info-item">
                    <p>Contact</p>
                    <p>${ev.contact_email} | ${ev.contact_phone}</p>
                </div>
            </div>

            <button class="btn-register" id="open-modal-btn">Register Participation</button>
        </div>
    </div>
    `;
    contentEl.innerHTML = html;

    document.querySelector('#open-modal-btn').addEventListener('click', () => {
        modalOverlay.style.display = 'flex';
    });
}
