import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from '../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TrackServiceService {

  constructor(private http: HttpClient) { }

  putProduct(itemURL: string, baseURL: string){
    let url = baseURL+'/fetch_item'
    return this.http.put(url, {
      'item_url': itemURL
    })
  }
}
