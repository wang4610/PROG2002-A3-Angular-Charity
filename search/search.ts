import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent implements OnInit {
  events: any[] = [];
  allEvents: any[] = [];
  categories: any[] = [];
  priceOptions: number[] = [];
  dateOptions: string[] = [];
  locationOptions: string[] = [];
  loading = false;
  sortBy = 'date-asc';

  filters = {
    category: 'all',
    location: 'all',
    event_date: 'all',
    maxPrice: '',
    onlyUpcoming: false,
    onlyFree: false
  };

  constructor(
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadPriceOptions();
    this.loadAllEvents();
  }

  loadCategories() {
    this.eventService.fetchCategories().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.categories = data;
        } else if (data && typeof data === 'object') {
          this.categories = data.data || data.categories || [];
        } else {
          this.categories = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  loadPriceOptions() {
    this.eventService.fetchPriceOptions().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.priceOptions = data;
        } else if (data && typeof data === 'object') {
          this.priceOptions = data.data || [];
        } else {
          this.priceOptions = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load price options:', err)
    });
  }

  loadAllEvents() {
    this.loading = true;
    this.eventService.fetchAllEvents().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.allEvents = data;
        } else if (data && typeof data === 'object') {
          this.allEvents = data.data || data.events || [];
        } else {
          this.allEvents = [];
        }
        this.events = [...this.allEvents];

        // 从活动数据中提取日期选项
        const uniqueDates = [...new Set(this.allEvents.filter(e => e.event_date).map(e => e.event_date))].sort();
        this.dateOptions = uniqueDates;

        // 从活动数据中提取地点选项
        const uniqueLocations = [...new Set(this.allEvents.filter(e => e.location).map(e => e.location))].sort();
        this.locationOptions = uniqueLocations;

        // 从活动数据中提取价格选项
        const priceSet = new Set(this.allEvents.filter(e => e.price !== undefined).map(e => e.price));
        this.priceOptions = Array.from(priceSet).sort((a, b) => a - b);

        this.applySort();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    // 前端本地筛选，不调用后端搜索接口（避免404问题）
    this.loading = true;
    let result = [...this.allEvents];
    
    // 按类别筛选
    if (this.filters.category && this.filters.category !== 'all') {
      result = result.filter(e => e.category === this.filters.category);
    }
    
    // 按地点筛选
    if (this.filters.location && this.filters.location !== 'all') {
      result = result.filter(e => e.location === this.filters.location);
    }
    
    // 按日期筛选
    if (this.filters.event_date && this.filters.event_date !== 'all') {
      result = result.filter(e => {
        const eventDate = new Date(e.event_date);
        const filterDate = new Date(this.filters.event_date);
        return eventDate >= filterDate;
      });
    }
    
    // 按价格筛选
    if (this.filters.maxPrice && this.filters.maxPrice !== '') {
      const maxPrice = Number(this.filters.maxPrice);
      result = result.filter(e => e.price <= maxPrice);
    }
    
    // 只显示即将到来的
    if (this.filters.onlyUpcoming) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(e => new Date(e.event_date) >= today);
    }
    
    // 只显示免费的
    if (this.filters.onlyFree) {
      result = result.filter(e => Number(e.price) === 0);
    }
    
    this.events = result;
    this.applySort();
    this.loading = false;
  }

  resetFilters() {
    this.filters = {
      category: 'all',
      location: 'all',
      event_date: 'all',
      maxPrice: '',
      onlyUpcoming: false,
      onlyFree: false
    };
    this.loadAllEvents();
  }

  applySort() {
    switch (this.sortBy) {
      case 'date-asc':
        this.events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
        break;
      case 'date-desc':
        this.events.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
        break;
      case 'price-low':
        this.events.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.events.sort((a, b) => b.price - a.price);
        break;
      case 'progress':
        this.events.sort((a, b) => (b.progress_percent || 0) - (a.progress_percent || 0));
        break;
    }
  }

  goToDetail(event: any) {
    const id = event.event_id || event.id;
    this.router.navigate(['/event', id]);
  }
}
