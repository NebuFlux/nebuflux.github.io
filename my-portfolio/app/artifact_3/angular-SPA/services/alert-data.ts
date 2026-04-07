import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from '../models/alert';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AlertData {

  constructor(
    private http: HttpClient
  ) {}
  baseURL = environment.apiBaseUrl;
  url = `${environment.apiBaseUrl}/alerts`;

  // Call to our /login endpoint, returns JWT
  login(user: User, passwd: string) : Observable<AuthResponse> {
    // console.log('Inside AlertData service::login');
    return this.handleAuthAPICall('login', user, passwd);
  }

  // Call to our /register endpoint, creates user and returns JWT
  register(user: User, passwd: string) : Observable<AuthResponse> {
    // console.log('Inside AlertData service::register');
    return this.handleAuthAPICall('register', user, passwd);
  }

  // helper method to process both login and register methods
  handleAuthAPICall(endpoint: string, user: User, passwd: string) : 
Observable<AuthResponse> {
    // console.log('Inside AlertData service::handleAuthAPICall');
    let formData = {
      username: user.username,
      password: passwd
    };

    return this.http.post<AuthResponse>(this.baseURL + '/' + endpoint, 
      formData);
  }

  getAlerts(params: {
    page?: number,
    limit?: number,
    sort?: string,
    order?: string,
    category?: string,
    search?: string,
    from?: Date,
    to?: Date
  } = {}) : Observable<any> {

    let httpParams = new HttpParams();
    if(params.page) httpParams = httpParams.set('page', params.page);
    if(params.limit) httpParams = httpParams.set('limit', params.limit);
    if(params.sort) httpParams = httpParams.set('sort', params.sort);
    if(params.order) httpParams = httpParams.set('order', params.order);
    if(params.category) httpParams = httpParams.set('category', params.category);
    if(params.search) httpParams = httpParams.set('search', params.search);
    if(params.from) httpParams  = httpParams.set('from', params.from.toISOString());
    if(params.to) httpParams = httpParams.set('to', params.to.toISOString());

    return this.http.get(this.url, { params: httpParams });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseURL}/logout`, {});
  }
}
