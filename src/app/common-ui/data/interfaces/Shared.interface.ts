export interface User {
  id: number;
  email: string;
  password: string;
}

export interface Email {
  id: number;
  subject: string;
  from: string;
  to: string;
  body: string;
  date: string;
}