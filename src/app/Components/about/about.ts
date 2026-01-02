import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../shared/header/header';
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    Header
  ],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.addFontAwesome();
  }
  private addFontAwesome(): void {
    if (!document.querySelector('#font-awesome')) {
      const link = document.createElement('link');
      link.id = 'font-awesome';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  get splitLetters(): any[] {
    const text = "StudentDiscount";
    const letters = [];
    for(let i = 0; i < text.length; i++) {
      const popDelay = (i * 0.1) + 's';
      const gradientDelay = '0.1s';
      letters.push({
        char: text[i],
        delays: `${popDelay}, ${gradientDelay}`,
        isSpace: text[i] === ' '
      });
    }
    return letters;
  }
}