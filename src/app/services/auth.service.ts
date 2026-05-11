import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  setDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

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

}