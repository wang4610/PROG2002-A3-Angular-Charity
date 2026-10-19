import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css'
})
export class RegistrationComponent implements OnInit {
  event: any = null;
  submitting = false;
  registrationSuccess = false;
  registrationError = '';

  formData = {
    full_name: '',
    email: '',
    phone: '',
    ticket_count: 1,
    message: '',
    event_id: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.formData.event_id = +id;
      this.loadEvent(+id);
    }
  }

  loadEvent(id: number) {
    this.eventService.fetchEventById(id).subscribe({
      next: (data: any) => {
        // 解包 data 字段
        this.event = data?.data || data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load event:', err)
    });
  }

  onSubmit() {
    if (!this.formData.full_name || !this.formData.email || !this.formData.phone) {
      this.registrationError = 'Please fill in all required fields.';
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.registrationError = '';
    this.cdr.detectChanges();

    this.eventService.submitRegistration(this.formData).subscribe({
      next: (response: any) => {
        console.log('Registration success:', response);
        this.registrationSuccess = true;
        this.submitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.submitting = false;

        // 区分不同的错误
        if (err.status === 409) {
          this.registrationError = 'You have already registered for this event.';
        } else if (err.status === 400) {
          this.registrationError = 'Invalid registration data. Please check your input.';
        } else {
          this.registrationError = 'Registration failed. Please try again later.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/event', this.formData.event_id]);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
