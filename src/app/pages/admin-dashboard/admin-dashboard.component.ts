import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { EnquiryService, Enquiry } from '../../services/enquiry.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  currentView: 'enquiries' | 'users' = 'enquiries';

  enquiries: Enquiry[] = [];
  filteredEnquiries: Enquiry[] = [];
  selectedEnquiry: Enquiry | null = null;

  users: User[] = [];
  filteredUsers: User[] = [];

  searchTerm = '';
  filterStatus = 'all';
  isLoading = true;
  sidebarCollapsed = false;
  showDetailPanel = false;

  // Stats
  totalEnquiries = 0;
  newCount = 0;
  inProgressCount = 0;
  resolvedCount = 0;
  totalUsers = 0;

  private subscription!: Subscription;

  constructor(
    private enquiryService: EnquiryService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEnquiries();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadEnquiries(): void {
    this.subscription = this.enquiryService.getEnquiries().subscribe({
      next: (data: Enquiry[]) => {
        this.enquiries = data.map(e => ({
          ...e,
          status: e.status || 'New'
        }));
        this.updateStats();
        if (this.currentView === 'enquiries') this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading enquiries:', err);
        this.isLoading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        console.log('DEBUG: Users received:', data);
        this.users = data;
        this.totalUsers = data.length;
        if (this.currentView === 'users') this.applyFilters();
      },
      error: (err: any) => console.error('Error loading users:', err)
    });
  }

  updateStats(): void {
    this.totalEnquiries = this.enquiries.length;
    this.newCount = this.enquiries.filter(e => e.status === 'New').length;
    this.inProgressCount = this.enquiries.filter(e => e.status === 'In Progress').length;
    this.resolvedCount = this.enquiries.filter(e => e.status === 'Resolved').length;
  }

  setView(view: 'enquiries' | 'users'): void {
    this.currentView = view;
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.currentView === 'enquiries') {
      let result = [...this.enquiries];
      // Status filter
      if (this.filterStatus !== 'all') {
        result = result.filter(e => e.status === this.filterStatus);
      }
      // Search filter
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        result = result.filter(e =>
          e.name?.toLowerCase().includes(term) ||
          e.mobile?.toLowerCase().includes(term) ||
          e.location?.toLowerCase().includes(term) ||
          e.type?.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term)
        );
      }
      this.filteredEnquiries = result;
    } else {
      let result = [...this.users];
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        result = result.filter(u =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
        );
      }
      this.filteredUsers = result;
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  // DETAIL PANEL
  openDetail(enquiry: Enquiry): void {
    this.selectedEnquiry = { ...enquiry };
    this.showDetailPanel = true;
  }

  closeDetail(): void {
    this.showDetailPanel = false;
    setTimeout(() => this.selectedEnquiry = null, 300);
  }

  // STATUS UPDATE
  async updateStatus(id: string | undefined, status: string): Promise<void> {
    if (!id) return;

    try {
      await this.enquiryService.updateEnquiryStatus(id, status);

      if (this.selectedEnquiry && this.selectedEnquiry.id === id) {
        this.selectedEnquiry.status = status;
      }

      Swal.fire({
        icon: 'success',
        title: `Status updated to "${status}"`,
        timer: 1500,
        showConfirmButton: false,
        background: '#1a1a2e',
        color: '#fff'
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to update status',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#d32f2f'
      });
    }
  }

  // DELETE
  async deleteEnquiry(id: string | undefined): Promise<void> {
    if (!id) return;

    const result = await Swal.fire({
      title: 'Delete this enquiry?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#555',
      background: '#1a1a2e',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await this.enquiryService.deleteEnquiry(id);
        this.closeDetail();

        Swal.fire({
          icon: 'success',
          title: 'Enquiry deleted',
          timer: 1500,
          showConfirmButton: false,
          background: '#1a1a2e',
          color: '#fff'
        });

      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to delete',
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#d32f2f'
        });
      }
    }
  }

  // FORMAT DATE
  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';

    let date: Date;

    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // TOGGLE SIDEBAR
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // LOGOUT
  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/admin-login']);
  }

  // STATUS BADGE CLASS
  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'New': return 'badge-new';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      default: return 'badge-new';
    }
  }
}
