import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
   url = 'http://pokeapi.co/api/v2/'; // disponer url de su servidor que tiene las páginas PHP
   constructor(private http: HttpClient) {

   }

  api(datos) {
    return this.http.get(`${this.url + datos.service}`);
  }

  
  
}
