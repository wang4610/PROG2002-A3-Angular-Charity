import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  events: any[] = [];
  stats = {
    totalFund: 0,
    totalEvent: 0,
    totalReg: 0,
    partner: 0
  };
  currentIndex = 0;
  modalOpen = false;
  selectedEvent: any = null;
  cardWidth = 320;

  @ViewChild('carouselTrack') carouselTrack!: ElementRef;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadHomeData();
  }

  ngAfterViewInit() {
    // 动态计算卡片宽度
    setTimeout(() => {
      this.updateCardWidth();
    }, 100);
  }

  updateCardWidth() {
    if (this.carouselTrack) {
      const card = this.carouselTrack.nativeElement.querySelector('.carousel-event-card');
      if (card) {
        // 卡片是 100% 宽度，直接用卡片宽度作为位移
        this.cardWidth = card.offsetWidth;
      }
    }
  }

  loadHomeData() {
    this.eventService.fetchHomeEvents().subscribe({
      next: (data: any) => {
        console.log('Home events data:', data);
        if (Array.isArray(data)) {
          this.events = data;
        } else if (data && typeof data === 'object') {
          this.events = data.data || data.events || data.items || [];
        } else {
          this.events = [];
        }
        // 数据加载后重新计算卡片宽度
        setTimeout(() => this.updateCardWidth(), 100);
      },
      error: (err) => console.error('Failed to load events:', err)
    });

    this.eventService.fetchStats().subscribe({
      next: (data: any) => {
        console.log('Stats data:', data);
        // API 返回格式是 { data: { totalFund: xxx, ... } }
        const statsData = data?.data || data || {};
        if (statsData) {
          this.stats = {
            totalFund: statsData.totalFund || statsData.total_fund || statsData.fundsRaised || statsData.totalFunds || 0,
            totalEvent: statsData.totalEvent || statsData.total_event || statsData.eventsCount || statsData.events || 0,
            totalReg: statsData.totalReg || statsData.total_reg || statsData.registrations || statsData.participants || 0,
            partner: statsData.partner || statsData.partners || statsData.partnerCount || 0
          };
        }
      },
      error: (err) => console.error('Failed to load stats:', err)
    });
  }

  prevSlide() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.events.length - 1;
    }
  }

  nextSlide() {
    this.currentIndex++;
    if (this.currentIndex >= this.events.length) {
      this.currentIndex = 0;
    }
  }

  openModal(event: any) {
    this.selectedEvent = event;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedEvent = null;
  }
}
