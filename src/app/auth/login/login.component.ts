import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RouterLink } from '@angular/router';


import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  user = {
    email: '',
    password: ''
  };

  isLoading = false;
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.user.email || !this.user.password) {
      Swal.fire('Error', 'Please enter email and password', 'error');
      return;
    }

    this.isLoading = true;

    try {

      await this.authService.login(
        this.user.email,
        this.user.password
      );

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        timer: 2000,
        showConfirmButton: false
      });

      this.router.navigate(['/home']);

    } catch (error: any) {

      Swal.fire({
        icon: 'error',
        title: 'Invalid Email or Password'
      });

    }

    this.isLoading = false;
  }

}