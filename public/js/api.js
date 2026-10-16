// 接口基础地址
const BASE_URL = "/api";

// 获取首页活动列表
export async function fetchHomeEvents() {
    const res = await fetch(`${BASE_URL}/home-events`);
    // 如果后端返回状态不是200，抛出错误
    if (!res.ok) throw new Error("response not ok");
    // 解析后端返回的JSON数据
    const data = await res.json();
    return data;
}

// 根据活动ID，获取单个活动详情（详情页用）
export async function fetchEventById(id) {
    const res = await fetch(`${BASE_URL}/events/${id}`);
    if (!res.ok) throw new Error("response not ok");
    return await res.json();
}

// 搜索活动，接收搜索参数（搜索页面用）
export async function searchEvents(queryParams) {
    const params = new URLSearchParams(queryParams);
    const res = await fetch(`${BASE_URL}/search?${params}`);
    if (!res.ok) throw new Error("response not ok");
    return await res.json();
}

// 获取所有活动分类（首页4个分类卡片用）
export async function fetchCategories() {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error("response not ok");
    return await res.json();
}
