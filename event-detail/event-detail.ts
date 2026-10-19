import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetailComponent implements OnInit {
  event: any = null;
  registrations: any[] = [];
  loading = true;
  weather: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEventDetails(+id);
      this.loadRegistrations(+id);
    }
  }

  loadEventDetails(id: number) {
    this.loading = true;
    this.eventService.fetchEventById(id).subscribe({
      next: (data: any) => {
        // API 返回格式是 { data: {...} }
        if (data && typeof data === 'object' && data.data) {
          this.event = data.data;
        } else {
          this.event = data;
        }
        this.loading = false;
        this.cdr.detectChanges();
        // 加载天气信息（用活动的经纬度，如果没有就用悉尼默认坐标）
        const lat = this.event?.latitude || -33.8688;
        const lon = this.event?.longitude || 151.2093;
        this.loadWeather(lat, lon);
      },
      error: (err) => {
        console.error('Failed to load event:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRegistrations(id: number) {
    this.eventService.getEventRegistrations(id).subscribe({
      next: (data) => {
        this.registrations = Array.isArray(data) ? data : (data?.data || []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load registrations:', err)
    });
  }

  loadWeather(lat: number, lon: number) {
    this.eventService.getWeather(lat, lon).subscribe({
      next: (data) => {
        this.weather = data?.current || null;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load weather:', err)
    });
  }

  // 获取天气图标
  getWeatherIcon(weatherCode: number): string {
    if (weatherCode === 0) return '☀️'; // 晴
    if (weatherCode <= 3) return '⛅'; // 多云
    if (weatherCode <= 67) return '🌧️'; // 雨
    if (weatherCode <= 77) return '❄️'; // 雪
    if (weatherCode <= 82) return '🌦️'; // 阵雨
    return '🌤️';
  }

  goToRegister() {
    const id = this.event?.event_id || this.event?.id;
    this.router.navigate(['/register', id]);
  }
}
