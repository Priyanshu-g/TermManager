import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private loginUrl = environment.apiUrl + '/login';
  private createUrl = environment.apiUrl + '/create';
  private updateUrl = environment.apiUrl + '/update';

  constructor(private http: HttpClient) { }

  // Method to make GET request
  // getData(): Observable<any> {
  //   return this.http.get<any>(this.loginUrl);
  // }

  // Method to make POST request
  postLogin(data: any): Observable<any> {
    return this.http.post<any>(this.loginUrl, data);
  }

  postCreateAcc(data: any): Observable<any> {
    return this.http.post<any>(this.createUrl, data);
  }

  postUpdate(data: any): Observable<any> {
    return this.http.post<any>(this.updateUrl, data);
  }
}