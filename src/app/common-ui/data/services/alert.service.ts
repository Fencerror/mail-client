import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private messageSubject = new BehaviorSubject<string | null>(null);
  message$ = this.messageSubject.asObservable();

  show(message: string, duration = 3000): void {
    this.messageSubject.next(message);
    setTimeout(() => this.clear(), duration);
  }

  clear(): void {
    this.messageSubject.next(null);
  }
}
