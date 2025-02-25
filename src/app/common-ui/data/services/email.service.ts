import { Injectable } from '@angular/core';
import { Email } from '../interfaces/Shared.interface';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private draftStorageKey = 'drafts';
  private storageKey = 'emails';
  private selectedEmailSubject = new BehaviorSubject<Email | null>(null); //Это свойство позволяет уведомлять компоненты о выбранном письме.
  selectedEmail$ = this.selectedEmailSubject.asObservable(); //Это свойство позволяет подписываться на изменения выбранного письма.
  constructor() {
    this.initializeStorage();
  }

  setSelectedEmail(email: Email): void {
    this.selectedEmailSubject.next(email);
  }
  
  private initializeStorage(): void {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  selectEmail(email: Email | null): void {
    this.selectedEmailSubject.next(email);
  }
  
  getEmails(): Email[] {
    const emails = localStorage.getItem(this.storageKey);
    return emails ? JSON.parse(emails) : [];
  }

  getEmailById(id: number): Email | undefined {
    const emails = this.getEmails();
    return emails.find(email => email.id === id);
  }

  addEmail(email: Email): void {
    const emails = this.getEmails();
    emails.push(email);
    localStorage.setItem(this.storageKey, JSON.stringify(emails));
  }

  deleteEmail(id: number): void {
    let emails = this.getEmails();
    emails = emails.filter(email => email.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(emails));
    
  }

  getDrafts(): Email[] {
    const drafts = localStorage.getItem(this.draftStorageKey);    
    return drafts ? JSON.parse(drafts) : [];                    
  }

  getDraftsByUser(email: string): Email[] {
    return this.getDrafts().filter(draft => draft.from === email);
  }

  saveDraft(email: Email): void {
    let drafts = this.getDrafts();
    const exIndex = drafts.findIndex(d => d.id === email.id);
  
    if (exIndex !== -1) {
      drafts[exIndex] = email; 
    } else {
      drafts.push(email); 
    }
  
    localStorage.setItem(this.draftStorageKey, JSON.stringify(drafts));
  }

  deleteDraft(id: number): void {
    let drafts = this.getDrafts().filter(email => email.id !== id);
    localStorage.setItem(this.draftStorageKey, JSON.stringify(drafts));
  }

  isDraft(emailId: number):boolean{
    const drafts = this.getDrafts();
    if (drafts.some(draft => draft.id === emailId)){
      return true;
    }
    return false;
  }
}
