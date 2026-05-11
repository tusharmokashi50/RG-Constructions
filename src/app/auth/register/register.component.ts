import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  Auth,
  createUserWithEmailAndPassword
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  setDoc
} from '@angular/fire/firestore';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  user = {
    name: '',
    email: '',
    password: ''
  };

  isLoading = false;

  async register() {

    if (
      !this.user.name ||
      !this.user.email ||
      !this.user.password
    ) {
      Swal.fire('Error', 'All fields required', 'error');
      return;
    }

    if (this.user.password.length < 6) {
      Swal.fire('Error', 'Password must be minimum 6 characters', 'error');
      return;
    }

    this.isLoading = true;

    try {

      // CREATE AUTH USER
      const userCredential =
        await createUserWithEmailAndPassword(
          this.auth,
          this.user.email,
          this.user.password
        );

      // SAVE USER DATA IN FIRESTORE
      await setDoc(
        doc(this.firestore, 'users', userCredential.user.uid),
        {
          uid: userCredential.user.uid,
          name: this.user.name,
          email: this.user.email,
          createdAt: new Date()
        }
      );

      Swal.fire(
        'Success',
        'Registration Successful',
        'success'
      );

      this.router.navigate(['/login']);

    } catch (error: any) {

      console.log(error);

      Swal.fire(
        'Registration Failed',
        error.message,
        'error'
      );
    }

    this.isLoading = false;
  }
}