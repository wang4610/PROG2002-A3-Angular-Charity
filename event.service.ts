import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  BASE_URL = "http://127.0.0.1:3000";

  constructor(private http: HttpClient) { }

  // ========== 客户端 API ==========

  // 获取首页统计数字
  fetchStats(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/api/stats`);
  }

  // 获取所有活动分类
  fetchCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/api/categories`);
  }

  // 获取慈善机构列表
  fetchOrganisations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/api/organisations`);
  }

  // 获取价格选项
  fetchPriceOptions(): Observable<number[]> {
    return this.http.get<number[]>(`${this.BASE_URL}/api/price-options`);
  }

  // 获取首页活动列表（轮播用）
  fetchHomeEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/api/home-events`);
  }

  // 获取全部活动
  fetchAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/api/home-events`);
  }

  // 搜索活动
  fetchSearchEvents(params: any): Observable<any[]> {
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'all') {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this.http.get<any[]>(`${this.BASE_URL}/api/events/search`, { params: httpParams });
  }

  // 根据ID获取单个活动
  fetchEventById(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/api/events/${id}`);
  }

  // 获取活动报名列表
  getEventRegistrations(eventId: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/api/events/${eventId}/registrations`);
  }

  // 提交活动报名
  submitRegistration(registrationData: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/api/register`, registrationData);
  }

  // ========== 管理端 API ==========

  // 获取所有活动（管理端）
  adminGetAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/api/admin/events`);
  }

  // 新增活动
  adminCreateEvent(payload: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/api/admin/events`, payload);
  }

  // 更新活动
  adminUpdateEvent(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/api/admin/events/${id}`, payload);
  }

  // 删除活动
  adminDeleteEvent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/api/admin/events/${id}`);
  }

  // ========== 天气 API (Open-Meteo) ==========

  // 根据经纬度获取当前天气
  getWeather(lat: number, lon: number): Observable<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    return this.http.get<any>(url);
  }
}
