import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface FeedBackCreateDto {
  email: string;
  category: string; 
  rating: number;
  suggestions?: string;
}
export interface FeedBackDto {
  id: string;
  email: string;
  category: string;
  rating: number;
  suggestions?: string;
  createdAt: Date;
}
export interface FeedBackStatsDto {
  totalFeedBacks: number;
  averageRating: number;
  categoryCounts: { [key: string]: number };
  ratingDistribution: { [key: number]: number };
}
@Injectable({
  providedIn: 'root'
})
export class FeedBackService {
  private apiUrl = 'https://localhost:7233/api/FeedBack';

  constructor(private http: HttpClient) { }
  createFeedBack(feedBack: FeedBackCreateDto): Observable<FeedBackDto> {
    return this.http.post<FeedBackDto>(this.apiUrl, feedBack);
  }
  getFeedBacksByEmail(email: string): Observable<FeedBackDto[]> {
    return this.http.get<FeedBackDto[]>(`${this.apiUrl}/email/${email}`);
  }
  getStatistics(): Observable<FeedBackStatsDto> {
    return this.http.get<FeedBackStatsDto>(`${this.apiUrl}/statistics`);
  }
  getRecentFeedBacks(count: number = 10): Observable<FeedBackDto[]> {
    return this.http.get<FeedBackDto[]>(`${this.apiUrl}/recent?count=${count}`);
  }
  getFeedBackById(id: string): Observable<FeedBackDto> {
    return this.http.get<FeedBackDto>(`${this.apiUrl}/${id}`);
  }
}