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
  setDoc,
  collection,
  query,
  where,
  getDocs
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
    mobile: '',
    password: ''
  };

  isLoading = false;

  async register() {

    if (
      !this.user.name ||
      !this.user.email ||
      !this.user.mobile ||
      !this.user.password
    ) {
      Swal.fire('Error', 'All fields required', 'error');
      return;
    }

    // Phone validation (exactly 10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(this.user.mobile)) {
      Swal.fire('Error', 'Invalid mobile number. Must be 10 digits.', 'error');
      return;
    }

    // Password complexity check (min 6 chars, 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(this.user.password)) {
      Swal.fire('Error', 'Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, and one number.', 'error');
      return;
    }

    this.isLoading = true;

    try {
      // CHECK IF EMAIL ALREADY EXISTS IN FIRESTORE
      const usersRef = collection(this.firestore, 'users');
      
      const emailQuery = query(usersRef, where('email', '==', this.user.email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        throw new Error('Email already registered');
      }

      // CHECK IF MOBILE ALREADY EXISTS IN FIRESTORE
      const mobileQuery = query(usersRef, where('mobile', '==', this.user.mobile));
      const mobileSnapshot = await getDocs(mobileQuery);
      if (!mobileSnapshot.empty) {
        throw new Error('Mobile number already registered');
      }

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
          mobile: this.user.mobile,
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