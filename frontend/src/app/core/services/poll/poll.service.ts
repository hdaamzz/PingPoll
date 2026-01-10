import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { ApiResponse, CreatePollRequest, Poll, UpdatePollRequest } from '../../interfaces/poll.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private _http = inject(HttpClient);
  private _apiUrl = `${environment.api_url}/polls`;

  createPoll(pollData: CreatePollRequest): Observable<Poll> {
    return this._http.post<ApiResponse<Poll>>(this._apiUrl, pollData).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create poll');
        }
        return response.data;
      })
    );
  }

  getUserPolls(): Observable<Poll[]> {
    return this._http.get<ApiResponse<{ polls: Poll[] }>>(`${this._apiUrl}/my-polls`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch polls');
        }
        return response.data.polls;
      })
    );
  }

  getPollById(pollId: string): Observable<Poll> {
    return this._http.get<ApiResponse<Poll>>(`${this._apiUrl}/${pollId}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch poll');
        }
        return response.data;
      })
    );
  }

  updatePoll(pollId: string, pollData: UpdatePollRequest): Observable<Poll> {
    return this._http.put<ApiResponse<Poll>>(`${this._apiUrl}/${pollId}`, pollData).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update poll');
        }
        return response.data;
      })
    );
  }

  deletePoll(pollId: string): Observable<void> {
    return this._http.delete<ApiResponse<void>>(`${this._apiUrl}/${pollId}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete poll');
        }
      })
    );
  }

  voteOnPoll(pollId: string, optionId: string): Observable<Poll> {
    return this._http.post<ApiResponse<Poll>>(`${this._apiUrl}/${pollId}/vote/${optionId}`, {}).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to vote');
        }
        return response.data;
      })
    );
  }

  getActivePolls(): Observable<Poll[]> {
    return this._http.get<ApiResponse<{ polls: Poll[] }>>(`${this._apiUrl}/active`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch active polls');
        }
        return response.data.polls;
      })
    );
  }
}
