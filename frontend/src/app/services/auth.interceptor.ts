import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, from, lastValueFrom, Observable } from 'rxjs';
import { RemoteService } from './remote.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  remoteService = inject(RemoteService);  
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    if(req.url.includes('/api/token')) {
      return handler.handle(req);
    }
    return from(this.handleAccess(req, handler));
  }
    
  private async handleAccess(req: HttpRequest<any>, handler: HttpHandler): Promise<HttpEvent<any>>  {
    const token = await this.remoteService.getTokenAsync();    
    this.storeToken(token);
    const changedReq = req.clone({
            headers: req.headers.append('Authorization', 'Bearer ' + token)
        });
      return lastValueFrom(handler.handle(changedReq));
  }

  storeToken(token: string) {
    this.remoteService.token.set(token);    
  }

}
