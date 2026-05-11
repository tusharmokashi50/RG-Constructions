import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  credentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async adminLogin() {

    if (!this.credentials.email || !this.credentials.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fill in all fields',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#d32f2f'
      });
      return;
    }

    this.isLoading = true;

    try {

      await this.authService.login(
        this.credentials.email,
        this.credentials.password
      );

      // Check if logged-in user is admin
      if (this.authService.isAdmin()) {

        Swal.fire({
          icon: 'success',
          title: 'Welcome, Admin!',
          text: 'Redirecting to dashboard...',
          timer: 1500,
          showConfirmButton: false,
          background: '#1a1a2e',
          color: '#fff'
        });

        this.router.navigate(['/admin']);

      } else {

        // Not an admin — log them out
        await this.authService.logout();

        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'You are not authorized as an admin.',
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#d32f2f'
        });

      }

    } catch (error: any) {

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password.',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#d32f2f'
      });

    }

    this.isLoading = false;
  }

}
