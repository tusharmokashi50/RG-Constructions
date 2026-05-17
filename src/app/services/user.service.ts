import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    query,
    orderBy,
    onSnapshot
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

export interface User {
    id?: string;
    name?: string;
    email?: string;
    mobile?: string;
    createdAt?: any;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private firestore = inject(Firestore);

    getUsers(): Observable<User[]> {
        return new Observable<User[]>(observer => {
            const usersRef = collection(this.firestore, 'users');
            const q = query(usersRef, orderBy('createdAt', 'desc'));

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const users: User[] = [];
                    snapshot.forEach(docSnap => {
                        users.push({
                            id: docSnap.id,
                            ...docSnap.data()
                        } as User);
                    });
                    observer.next(users);
                },
                (error) => {
                    console.error("UserService Error:", error);
                    observer.error(error);
                }
            );

            return () => unsubscribe();
        });
    }
}
