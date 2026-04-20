import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/users';

  constructor(private http: HttpClient) {}

  sendOtp(data: any) {
    return this.http.post(`${this.apiUrl}/send-otp`, data);
  }

  verifyOtp(data: any) {
    return this.http.post(`${this.apiUrl}/verify-otp`, data);
  }

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }
}