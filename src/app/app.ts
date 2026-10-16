import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  isScrolled = false;
  menuOpen = false;
  showBackToTop = false;

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 50;
    this.showBackToTop = window.scrollY > 300;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
