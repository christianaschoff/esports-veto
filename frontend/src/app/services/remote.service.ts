import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Constellation, ConstellationResponse, JoinVetoResponse, VetoBaseDataResponse } from '../data/veto-constellation.data';
import { catchError, lastValueFrom, Observable, tap, throwError } from 'rxjs';
import { GlobalStore } from '../store/store';

@Injectable({
  providedIn: 'root'  
})
export class RemoteService {
    
  globalState = inject(GlobalStore);

  public joinSessionData: WritableSignal<JoinVetoResponse> = signal({} as JoinVetoResponse);
  public token = signal('');
  public tokenTimeout = signal(-1);

  constructor(private readonly httpClient : HttpClient) { 
  }

  calculateCurrentUtcTime(addMinutes: number = 0): number {
    const now = new Date()
    const utcMilllisecondsSinceEpoch = now.getTime();
    return Math.round((utcMilllisecondsSinceEpoch / 1000) + (addMinutes * 60));
  }

  async getTokenAsync() : Promise<string> {  
    if(this.token() && this.tokenTimeout() > this.calculateCurrentUtcTime()) { 
      return this.token();
    }
    return lastValueFrom(this.httpClient.get<string>('/api/token')
            .pipe(tap(_ => this.tokenTimeout.set(this.calculateCurrentUtcTime(29)))));
  }

  createRemoteVeto(constellation: Constellation) : Observable<ConstellationResponse> {    
    this.globalState.setLoading(true);
    return this.httpClient.post<ConstellationResponse>('/api/create', constellation)              
              .pipe(tap(() => this.globalState.setLoading(false)),
            );     
  }
  
async loadRemoteVetoAdminAsync(vetoId: string) : Promise<ConstellationResponse> {
    this.globalState.setLoading(true);
    return lastValueFrom(this.httpClient.get<ConstellationResponse>(`/api/create/${vetoId}`)
            .pipe(tap(x => this.globalState.setLoading(false)))
          );
  }

  async joinSessionAsync(attendee: string, id: string) : Promise<JoinVetoResponse> {
    this.globalState.setLoading(true);
     return lastValueFrom(this.httpClient.get<JoinVetoResponse>(`/api/veto/${attendee}/${id}`)
              .pipe(tap(x => this.globalState.setLoading(false)))
            );
  }

  async receiveVetoBaseInformationAsync(vetoId: string) : Promise<VetoBaseDataResponse> {
    this.globalState.setLoading(true);
    return lastValueFrom(this.httpClient.get<VetoBaseDataResponse>(`/api/veto/${vetoId}`)
            .pipe(tap(x => this.globalState.setLoading(false)))
          );
  }
}
