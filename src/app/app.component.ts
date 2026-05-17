import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'rg_construction';

  isFabOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Listen to auth state changes globally
    this.authService.user$.subscribe(user => {
      console.log('[DEBUG] user$ emitted', user, 'router.url is:', this.router.url);
      if (!user && this.isProtectedRoute()) {
        console.log('[DEBUG] redirecting to /login because isProtectedRoute returned true');
        this.router.navigate(['/login']);
      }
    });
  }

  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }

  isAuthPage(): boolean {
    // Clean URL to handle trailing slashes and query parameters gracefully on deployed environments like Vercel
    const cleanUrl = this.router.url.split('?')[0].split('#')[0].replace(/\/$/, '');
    
    return cleanUrl === '/login'
        || cleanUrl === '/register'
        || cleanUrl === '/admin-login';
  }

  isProtectedRoute(): boolean {
    // If we're already on an auth page, it's not a "protected" content page in this context
    if (this.isAuthPage()) return false;

    // Explicitly allow admin-login to NEVER be protected, just to be 100% safe against trailing slashes/query params
    if (this.router.url.includes('admin-login')) return false;

    // Routes that should NOT be accessible without login
    const protectedRoutes = ['/home', '/admin', '/services', '/projects', '/contact'];
    
    // Use exact match or check for specific subroutes/params to avoid matching '/admin-login' with '/admin'
    return protectedRoutes.some(route => 
      this.router.url === route || 
      this.router.url.startsWith(route + '/') || 
      this.router.url.startsWith(route + '#') ||
      this.router.url.startsWith(route + '?')
    );
  }
}
