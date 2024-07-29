import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private loginUrl = 'http://localhost:8080/login';
  private createUrl = 'http://localhost:8080/create';
  private updateUrl = 'http://localhost:8080/update';

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