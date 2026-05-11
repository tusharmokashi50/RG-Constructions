import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import emailjs from 'emailjs-com';
import Swal from 'sweetalert2'; 
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule], // 🔥 VERY IMPORTANT
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  constructor(private firestore: Firestore) {}

  enquiry = {
    name: '',
    mobile: '',
    location: '',
    type: '',
    description: ''
  };

  showOtherField = false;
  isSubmitting = false;

  onTypeChange() {
    this.showOtherField = this.enquiry.type === 'Other';
  }

  isFormValid(): boolean {

    const nameValid = this.enquiry.name.trim().length >= 3;
    const mobileValid = /^[6-9]\d{9}$/.test(this.enquiry.mobile); // Indian number
    const typeValid = this.enquiry.type !== '';
  
    const descriptionValid =
      this.enquiry.type !== 'Other' ||
      this.enquiry.description.trim().length > 5;
  
    return nameValid && mobileValid && typeValid && descriptionValid;
  }

 

  async submitEnquiry(form: any) {

    if (!this.isFormValid()) return;
  
    this.isSubmitting = true;
  
    try {
  
      const ref = collection(this.firestore, 'enquiries');
  
      await addDoc(ref, {
        ...this.enquiry,
        createdAt: new Date()
      });
  
      // ✅ Show success after Firestore save
      Swal.fire({
        title: 'Enquiry sent successfully',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });

      // 📧 Send email notification (non-blocking)
      emailjs.send(
        'service_pvxk7ul',
        'template_2n3k597',
        {
          name: this.enquiry.name,
          mobile: this.enquiry.mobile,
          location: this.enquiry.location,
          type: this.enquiry.type,
          description: this.enquiry.description || 'N/A'
        },
        'oFDUXP_wTuYXGM6jq'
      ).catch(emailErr => {
        console.warn("⚠️ Email notification failed:", emailErr);
      });
  
      // ✅ RESET FORM COMPLETELY
      form.resetForm();
  
      // optional reset (safe)
      this.enquiry = {
        name: '',
        mobile: '',
        location: '',
        type: '',
        description: ''
      };
  
      this.showOtherField = false;
  
    } catch (err) {
      console.error("❌ ERROR:", err);
      Swal.fire({
        title: 'Failed to send enquiry',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  
    this.isSubmitting = false;
  }

}