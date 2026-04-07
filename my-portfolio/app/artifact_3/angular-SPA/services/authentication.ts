import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { AlertData } from './alert-data';
import { tap, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Authentication {
  constructor (
    private alertData: AlertData
  ) {}

  // Variable to handle Auth Response
  authResp: AuthResponse = new AuthResponse();

  // Logout & remove JWT from storage
  public logout(): void{
    this.alertData.logout().subscribe();
  }

  // Boolean to determine if user is logged in and token is valid.
  // will need to reauthenticate if token expires.
  public isLoggedIn(): boolean {
    const expire = sessionStorage.getItem('token_expiry');
    if (expire){
      return parseInt(expire) > (Date.now() / 1000);
    }
    return false;
  }

  // Retrieve current user.
  // Only called after isLoggedIn() returns true.
  public getCurrentUser(): string {
    return sessionStorage.getItem('username') || '';
  }

  // Login method leveraging login method in alertData service
  // AlertData method returns an observable, we subscribe to result
  // only process when the Observable condition is satisfied
  public login(user: User, passwd: string) : Observable<AuthResponse> {
    return this.alertData.login(user,passwd)
      .pipe(tap({
        next: (value: any) => {
          if(value){
            //console.log(value);
            this.authResp = value;
            sessionStorage.setItem('username', value.username);
            sessionStorage.setItem('token_expiry', value.expire);
          }
        },
        error: (error: any) => {
          console.log('Error: ' + error);
        }
      }))
  }

  // Register method leveraging register method in alertData service
  // NOTE: nearly identical to login method, API logs a new user in
  // immediately upon registration
  public register(user: User, passwd: string) : Observable<AuthResponse> {
    return this.alertData.register(user, passwd)
      .pipe(tap({
        next: (value: any) => {
          if(value){
            console.log(value);
            this.authResp = value;
            sessionStorage.setItem('username', value.username);
            sessionStorage.setItem('token_expiry', value.expire);
          }
        },
        error: (error: any) => {
          console.log('Error: ' + error);
        }
      }))
  }
}
