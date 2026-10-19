import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-admin-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-list.html',
  styleUrl: './admin-list.css'
})
export class AdminListComponent implements OnInit {
  eventList: any[] = [];
  loading = true;
  msg = '';
  msgColor = '#000';

  constructor(
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadList();
  }

  loadList() {
    this.loading = true;
    this.eventService.adminGetAllEvents().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.eventList = data;
        } else if (data && typeof data === 'object') {
          this.eventList = data.data || data.events || data.items || [];
        } else {
          this.eventList = [];
        }
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

  deleteItem(id: number) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.adminDeleteEvent(id).subscribe({
        next: () => {
          this.msg = 'Event deleted successfully.';
          this.msgColor = '#27ae60';
          this.loadList();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.msg = 'Failed to delete event. It may have registrations.';
          this.msgColor = '#c0392b';
        }
      });
    }
  }
}
