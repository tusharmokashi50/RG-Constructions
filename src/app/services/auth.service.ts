import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  authState,
  User
} from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  Firestore,
  doc,
  setDoc
} from '@angular/fire/firestore';

// 🔐 Admin email — change this to your admin email
const ADMIN_EMAIL = 'admin@rgconstruction.com';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.user$ = user(this.auth);
    this.isAdmin$ = this.user$.pipe(
      map(user => !!user && user.email === ADMIN_EMAIL)
    );
  }

  // REGISTER USER
  async register(
    name: string,
    email: string,
    password: string
  ) {

    const userCredential =
      await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

    const user = userCredential.user;

    // SAVE USER DATA IN FIRESTORE
    await setDoc(doc(this.firestore, 'users', user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      createdAt: new Date()
    });

    return user;
  }

  // LOGIN
  login(email: string, password: string) {
    return signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );
  }

  // LOGOUT
  logout() {
    return signOut(this.auth);
  }

  // GET CURRENT USER
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // CHECK IF CURRENT USER IS ADMIN
  isAdmin(): boolean {
    const user = this.auth.currentUser;
    return !!user && user.email === ADMIN_EMAIL;
  }

  // GET ADMIN EMAIL (for display)
  getAdminEmail(): string {
    return ADMIN_EMAIL;
  }

}