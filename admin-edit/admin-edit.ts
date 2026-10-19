import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-admin-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-edit.html',
  styleUrl: './admin-edit.css'
})
export class AdminEditComponent implements OnInit {
  eventId = 0;
  categoryList: any[] = [];
  orgList: any[] = [];
  msg = '';
  msgColor = '#000';

  formData: any = {
    title: '',
    description: '',
    location: '',
    cat_id: 1,
    event_date: '',
    price: 0,
    progress_percent: 0,
    image_url: '',
    org_id: 1
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = +id;
      this.loadEvent(this.eventId);
    }

    this.eventService.fetchCategories().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.categoryList = data;
        } else if (data && typeof data === 'object') {
          this.categoryList = data.data || data.categories || [];
        } else {
          this.categoryList = [];
        }
      }
    });

    this.eventService.fetchOrganisations().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.orgList = data;
        } else if (data && typeof data === 'object') {
          this.orgList = data.data || data.organisations || [];
        } else {
          this.orgList = [];
        }
      }
    });
  }

  loadEvent(id: number) {
    this.eventService.fetchEventById(id).subscribe({
      next: (data: any) => {
        // 解包 data 字段
        const eventData = data?.data || data;
        if (eventData) {
          this.formData = {
            title: eventData.title || '',
            description: eventData.description || '',
            location: eventData.location || '',
            cat_id: eventData.cat_id || eventData.category_id || 1,
            event_date: eventData.event_date || '',
            price: eventData.price || 0,
            progress_percent: eventData.progress_percent || 0,
            image_url: eventData.image_url || eventData.imageUrl || '',
            org_id: eventData.org_id || 1
          };
        }
      },
      error: (err) => {
        console.error('Failed to load event:', err);
        this.msg = 'Failed to load event details.';
        this.msgColor = '#c0392b';
      }
    });
  }

  onSubmit() {
    this.eventService.adminUpdateEvent(this.eventId, this.formData).subscribe({
      next: () => {
        this.msg = 'Event updated successfully!';
        this.msgColor = '#27ae60';
        setTimeout(() => this.router.navigate(['/admin']), 1000);
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.msg = 'Failed to update event. Please try again.';
        this.msgColor = '#c0392b';
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
