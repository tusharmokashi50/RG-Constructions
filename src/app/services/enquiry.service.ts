import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Enquiry {
  id?: string;
  name: string;
  mobile: string;
  location: string;
  type: string;
  description: string;
  status?: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {

  private firestore = inject(Firestore);
  private collectionName = 'enquiries';

  // GET ALL ENQUIRIES (REAL-TIME using native onSnapshot)
  getEnquiries(): Observable<Enquiry[]> {
    return new Observable<Enquiry[]>(observer => {
      const ref = collection(this.firestore, this.collectionName);
      const q = query(ref, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const enquiries: Enquiry[] = [];
          snapshot.forEach(docSnap => {
            enquiries.push({
              id: docSnap.id,
              ...docSnap.data()
            } as Enquiry);
          });
          observer.next(enquiries);
        },
        (error) => {
          observer.error(error);
        }
      );

      // Cleanup on unsubscribe
      return () => unsubscribe();
    });
  }

  // UPDATE STATUS
  async updateEnquiryStatus(id: string, status: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(docRef, { status });
  }

  // DELETE ENQUIRY
  async deleteEnquiry(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
