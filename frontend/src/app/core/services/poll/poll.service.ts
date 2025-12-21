import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';




export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  title: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  status: 'active' | 'closed' | 'draft';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface CreatePollRequest {
  title: string;
  question: string;
  options: { id: string; text: string }[];
  expiresAt?: Date;
}

export interface UpdatePollRequest {
  title?: string;
  question?: string;
  status?: 'active' | 'closed' | 'draft';
  expiresAt?: Date;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}


@Injectable({
  providedIn: 'root'
})
export class PollService {
private http = inject(HttpClient);
  private apiUrl = `${environment.api_url}/polls`;

  createPoll(pollData: CreatePollRequest): Observable<Poll> {
    return this.http.post<ApiResponse<Poll>>(this.apiUrl, pollData).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create poll');
        }
        return response.data;
      })
    );
  }

  getUserPolls(): Observable<Poll[]> {
    return this.http.get<ApiResponse<{ polls: Poll[] }>>(`${this.apiUrl}/my-polls`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch polls');
        }
        return response.data.polls;
      })
    );
  }

  getPollById(pollId: string): Observable<Poll> {
    return this.http.get<ApiResponse<Poll>>(`${this.apiUrl}/${pollId}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch poll');
        }
        return response.data;
      })
    );
  }

  updatePoll(pollId: string, pollData: UpdatePollRequest): Observable<Poll> {
    return this.http.put<ApiResponse<Poll>>(`${this.apiUrl}/${pollId}`, pollData).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update poll');
        }
        return response.data;
      })
    );
  }

  deletePoll(pollId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${pollId}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete poll');
        }
      })
    );
  }

  voteOnPoll(pollId: string, optionId: string): Observable<Poll> {
    return this.http.post<ApiResponse<Poll>>(`${this.apiUrl}/${pollId}/vote/${optionId}`, {}).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to vote');
        }
        return response.data;
      })
    );
  }

  getActivePolls(): Observable<Poll[]> {
    return this.http.get<ApiResponse<{ polls: Poll[] }>>(`${this.apiUrl}/active`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch active polls');
        }
        return response.data.polls;
      })
    );
  }
}
