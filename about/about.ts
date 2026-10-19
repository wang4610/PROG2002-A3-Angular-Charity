import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent {
  teamList = [
    { name: 'Emily Watson', role: 'Executive Director', img: 'https://picsum.photos/id/1005/400/400' },
    { name: 'Michael Chen', role: 'Events Manager', img: 'https://picsum.photos/id/1012/400/400' },
    { name: 'Sarah Rodriguez', role: 'Community Outreach Lead', img: 'https://picsum.photos/id/1025/400/400' },
    { name: 'James Wilson', role: 'Volunteer Coordinator', img: 'https://picsum.photos/id/1035/400/400' }
  ];
}
