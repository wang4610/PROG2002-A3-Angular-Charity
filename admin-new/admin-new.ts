import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-admin-new',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-new.html',
  styleUrl: './admin-new.css'
})
export class AdminNewComponent implements OnInit {
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
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
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

  onSubmit() {
    this.eventService.adminCreateEvent(this.formData).subscribe({
      next: () => {
        this.msg = 'Event created successfully!';
        this.msgColor = '#27ae60';
        setTimeout(() => this.router.navigate(['/admin']), 1000);
      },
      error: (err) => {
        console.error('Create failed:', err);
        this.msg = 'Failed to create event. Please try again.';
        this.msgColor = '#c0392b';
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
