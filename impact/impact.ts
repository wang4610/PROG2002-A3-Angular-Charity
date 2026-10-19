import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-impact',
  imports: [CommonModule],
  templateUrl: './impact.html',
  styleUrl: './impact.css'
})
export class ImpactComponent {
  statList = [
    { label: 'Total Funds Raised', value: 128000 },
    { label: 'Volunteers', value: 2460 },
    { label: 'Families Supported', value: 320 },
    { label: 'Events Hosted', value: 48 }
  ];

  testimonialList = [
    { name: 'Sarah M.', role: 'Volunteer, Sydney', text: 'I joined the Fun Run last year and it was such a rewarding experience.', img: 'https://picsum.photos/id/1005/100/100' },
    { name: 'James L.', role: 'Participant, Melbourne', text: 'The Gala Dinner was beautifully organised and for a great cause.', img: 'https://picsum.photos/id/1012/100/100' },
    { name: 'Emma R.', role: 'Donor, Brisbane', text: 'Knowing my donation went to winter shelter supplies was wonderful.', img: 'https://picsum.photos/id/1025/100/100' }
  ];
}
