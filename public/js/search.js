import { fetchCategories, fetchSearchEvents } from './api.js';
import {
    initScrollFade, initNavbarScroll, initHamburgerMenu, generateSkeletonCards,
    setBreadcrumb, initLightbox, initBackToTop, showToast
} from './ui-components.js';
const formEl = document.querySelector("#search-event-form");
const catSelect = document.querySelector("#filter-cat");
const dateSelect = document.querySelector("#filter-date");
const locSelect = document.querySelector("#filter-location");
const btnClear = document.querySelector("#btn-clear-filters");
const resultGrid = document.querySelector("#search-result-grid");
const skeletonWrap = document.querySelector("#skeleton-search-wrap");
const errorBox = document.querySelector("#error-box");
const chipsWrap = document.querySelector("#filter-chips-wrap");
const priceRange = document.querySelector("#price-range");
const priceValue = document.querySelector("#price-value");
const onlyUpcoming = document.querySelector("#only-upcoming");
const onlyFree = document.querySelector("#only-free");
const sortSelect = document.querySelector("#sort-events");
const resultCountText = document.querySelector("#result-count-text");
let activeFilters = {};
let rawEventList = [];
let categoryList = [];

window.addEventListener("DOMContentLoaded", async () => {
    initNavbarScroll();
    initHamburgerMenu();
    initBackToTop();
    setBreadcrumb([
        { text: "Home", link: "./index.html" },
        { text: "Search Events" }
    ]);
    priceRange.addEventListener('input', () => {
        priceValue.innerText = "$" + priceRange.value;
    });
    const urlParams = new URLSearchParams(window.location.search);
    const urlCatId = urlParams.get('cat_id');
    if(urlCatId) activeFilters.cat_id = urlCatId;
    skeletonWrap.innerHTML = generateSkeletonCards(4);
    //加载分类 + 全部活动数据
    try {
        const catResp = await fetchCategories();
        if (catResp.success) {
            categoryList = catResp.data;
            catResp.data.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.cat_id;
                opt.textContent = c.cat_name;
                catSelect.appendChild(opt);
            });
            if (activeFilters.cat_id) catSelect.value = activeFilters.cat_id;
        }
        //一次性拿全部活动
        const allEventsResp = await fetchSearchEvents({});
        skeletonWrap.innerHTML = "";
        if(allEventsResp.success){
            rawEventList = [...allEventsResp.data];
            //填充【日期下拉】全部选项
            const uniqueDates = [...new Set(rawEventList.map(item => item.event_date))].sort();
            uniqueDates.forEach(dateStr => {
                const opt = document.createElement("option");
                opt.value = dateStr;
                opt.textContent = dateStr;
                dateSelect.appendChild(opt);
            });
            //填充【地点下拉】全部选项
            const uniqueLocations = [...new Set(rawEventList.map(item => item.location))].sort();
            uniqueLocations.forEach(locStr => {
                const opt = document.createElement("option");
                opt.value = locStr;
                opt.textContent = locStr;
                locSelect.appendChild(opt);
            });
            //首页分类跳转过来直接渲染
            if(urlCatId){
                applyLocalFilterAndRender();
            }
        }
    } catch (e) {
        skeletonWrap.innerHTML = "";
        showToast("error", "Failed to load event data");
    }
    //重置按钮
    btnClear.addEventListener('click', () => {
        formEl.reset();
        priceRange.value = 200;
        priceValue.innerText = "$200";
        activeFilters = {};
        chipsWrap.innerHTML = "";
        resultGrid.innerHTML = '';
        errorBox.innerHTML = '';
        resultCountText.innerText = "Use the filters to find charity events.";
        localStorage.removeItem("charitySearchFilters");
    });
    sortSelect.addEventListener("change", () => {
        applyLocalFilterAndRender();
    });
    //提交搜索
    formEl.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const dateVal = dateSelect.value.trim();
        const locVal = locSelect.value.trim();
        const catVal = catSelect.value;
        activeFilters = {};
        if(dateVal) activeFilters.date = dateVal;
        if(locVal) activeFilters.location = locVal;
        if(catVal) activeFilters.cat_id = catVal;
        activeFilters.maxPrice = Number(priceRange.value);
        activeFilters.onlyUpcoming = onlyUpcoming.checked;
        activeFilters.onlyFree = onlyFree.checked;
        localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
        renderFilterChips();
        applyLocalFilterAndRender();
    });
});

//前端本地筛选核心
function applyLocalFilterAndRender() {
    let list = [...rawEventList];
    if(activeFilters.location){
        list = list.filter(item => item.location === activeFilters.location);
    }
    if(activeFilters.cat_id){
        list = list.filter(item => String(item.cat_id) === String(activeFilters.cat_id));
    }
    if(activeFilters.date){
        list = list.filter(item => item.event_date === activeFilters.date);
    }
    if (activeFilters.maxPrice !== undefined) {
        list = list.filter(item => Number(item.ticket_price) <= Number(activeFilters.maxPrice));
    }
    if (activeFilters.onlyUpcoming) {
        list = list.filter(item => item.event_status === "upcoming");
    }
    if (activeFilters.onlyFree) {
        list = list.filter(item => Number(item.ticket_price) === 0);
    }
    //排序
    const sortVal = sortSelect.value;
    switch (sortVal) {
        case "date-asc":
            list.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
            break;
        case "date-desc":
            list.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
            break;
        case "price-low":
            list.sort((a, b) => Number(a.ticket_price) - Number(b.ticket_price));
            break;
        case "price-high":
            list.sort((a, b) => Number(b.ticket_price) - Number(a.ticket_price));
            break;
        case "progress":
            list.sort((a, b) => b.progress_percent - a.progress_percent);
            break;
    }
    resultCountText.innerText = `Found ${list.length} matching event(s)`;

    //===== 没有匹配结果：显示提示 + 推荐2个活动 =====
    if (list.length === 0) {
        //取全部活动里面最新2个作为推荐
        const recommendEvents = [...rawEventList]
            .sort((a,b)=>new Date(b.event_date)-new Date(a.event_date))
            .slice(0,2);
        let recommendHtml = '';
        recommendEvents.forEach(ev=>{
            const statusBadge = ev.event_status === 'upcoming'
                ? `<span class="badge-upcoming">Upcoming</span>`
                : `<span class="badge-past">Past</span>`;
            const progressPercent = ev.progress_percent || 0;
            recommendHtml += `
            <div class="event-card" data-id="${ev.event_id}">
                <img src="${ev.event_image_url}" alt="${ev.event_name}" data-lightbox>
                <div class="card-body">
                    <div class="badge-row">${statusBadge}<span class="event-category-tag">${ev.cat_name}</span></div>
                    <h3>${ev.event_name}</h3>
                    <p>${ev.event_short_description}</p>
                    <div class="event-meta">
                        <span>📍 ${ev.location}</span>
                        <span>🗓 ${new Date(ev.event_date).toLocaleString()}</span>
                    </div>
                    <div class="progress-wrap" style="margin:0.8rem 0;"><div class="progress-bar" style="width:${progressPercent}%"></div></div>
                    <div class="card-footer">
                        <span class="price-tag">${ev.ticket_price>0?"$"+ev.ticket_price.toFixed(2):"Free"}</span>
                        <span class="btn-link">View Details</span>
                    </div>
                </div>
            </div>`;
        })
        resultGrid.innerHTML = `
        <div class="empty-note" style="text-align:center;padding:3rem 1rem;">
            <h4>No matching charity events found</h4>
            <p>No events fit your selected filters. Try changing your filter options.</p>
            <button class="btn btn-secondary" onclick="document.querySelector('#btn-clear-filters').click()">Reset All Filters</button>
            <h4 style="margin:24px 0 12px">Recommended events for you</h4>
        </div>
        <div class="event-grid">${recommendHtml}</div>
        `;
        //给推荐卡片绑定点击跳转详情
        resultGrid.querySelectorAll('.event-card').forEach(card =>{
            card.addEventListener('click',()=>{
                const eid = card.dataset.id;
                window.location.href=`./event-detail.html?eventId=${eid}`;
            })
        })
        return;
    }
    renderCards(list);
    initScrollFade(".event-card");
    initLightbox();
}

function renderFilterChips() {
    chipsWrap.innerHTML = "";
    if (Object.keys(activeFilters).length === 0) return;
    if (activeFilters.date) {
        const chip = createChip(`Date: ${activeFilters.date}`, () => {
            delete activeFilters.date;
            dateSelect.value = "";
            localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
            renderFilterChips();
            applyLocalFilterAndRender();
        });
        chipsWrap.appendChild(chip);
    }
    if (activeFilters.location) {
        const chip = createChip(`Location: ${activeFilters.location}`, () => {
            delete activeFilters.location;
            locSelect.value = "";
            localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
            renderFilterChips();
            applyLocalFilterAndRender();
        });
        chipsWrap.appendChild(chip);
    }
    if (activeFilters.cat_id) {
        const catObj = categoryList.find(c => String(c.cat_id) === String(activeFilters.cat_id));
        const label = catObj ? `Category: ${catObj.cat_name}` : `Category ID:${activeFilters.cat_id}`;
        const chip = createChip(label, () => {
            delete activeFilters.cat_id;
            catSelect.value = "";
            localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
            renderFilterChips();
            applyLocalFilterAndRender();
        });
        chipsWrap.appendChild(chip);
    }
}

function createChip(text, onClose) {
    const div = document.createElement("div");
    div.className = "chip-tag";
    div.innerHTML = `${text}<span class="chip-close">×</span>`;
    div.querySelector(".chip-close").addEventListener("click", onClose);
    return div;
}

function renderCards(eventList) {
    let html = '';
    eventList.forEach(ev => {
        const statusBadge = ev.event_status === 'upcoming'
            ? `<span class="badge-upcoming">Upcoming</span>`
            : `<span class="badge-past">Past</span>`;
        const progressPercent = ev.progress_percent || 0;
        html += `
        <div class="event-card" data-id="${ev.event_id}">
            <img src="${ev.event_image_url}" alt="${ev.event_name}" data-lightbox>
            <div class="card-body">
                <div class="badge-row">
                    ${statusBadge}
                    <span class="event-category-tag">${ev.cat_name}</span>
                </div>
                <h3>${ev.event_name}</h3>
                <p>${ev.event_short_description}</p>
                <div class="event-meta">
                    <span>📍 ${ev.location}</span>
                    <span>🗓 ${new Date(ev.event_date).toLocaleString()}</span>
                </div>
                <div class="progress-wrap" style="margin:0.8rem 0;">
                    <div class="progress-bar" style="width:${progressPercent}%"></div>
                </div>
                <div class="card-footer">
                    <span class="price-tag">${ev.ticket_price>0?"$"+ev.ticket_price.toFixed(2):"Free"}</span>
                    <span class="btn-link">View Details</span>
                </div>
            </div>
        </div>
        `;
    });
    resultGrid.innerHTML = html;
    //搜索列表卡片点击跳详情页
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eid = card.dataset.id;
            window.location.href = `./event-detail.html?eventId=${eid}`;
        });
    });
}
