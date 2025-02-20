import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from 'app/common-ui/data/services/alert.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-alert',
  template: `
  <!-- html тело для алертов-->
  <div *ngIf="message$ | async as msg" 
    class="alert alert-info position-fixed bottom-0 start-50 translate-middle-x mb-4" 
    role="alert">
  {{ msg }} 
</div>
  `,
  imports: [CommonModule]
})

export class AlertComponent implements OnInit {
  message$!: Observable<string | null>;
  private alertService: AlertService = inject(AlertService);

  ngOnInit(): void {
    this.message$ = this.alertService.message$; 
  }
}
