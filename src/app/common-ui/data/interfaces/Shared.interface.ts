export interface User {
  id: number;
  phoneNumber: string;
  email: string;
  password: string;
  emailSpam: string[];
}

export interface Email {
  id: number;
  subject: string;
  from: string;
  to: string;
  body: string;
  date: string;
}
