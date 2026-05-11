import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rg_construction';

  isFabOpen = false;

  constructor(private router: Router) {}

  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }

  isAuthPage(): boolean {

    return this.router.url === '/login'
        || this.router.url === '/register';

  }
}
