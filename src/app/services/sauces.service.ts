import { Injectable } from '@angular/core';
import { catchError, mapTo, of, Subject, tap, throwError } from 'rxjs';
import { Sauce } from '../models/Sauce.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SaucesService {

  sauces$ = new Subject<Sauce[]>();

  constructor(private http: HttpClient,
              private auth: AuthService) {}




              private updateImageUrls(sauces: Sauce[]): Sauce[] {
                return sauces.map(sauce => {
                  // Assuming sauce.imageUrl is the complete URL for the image
                  if (sauce.imageUrl && sauce.imageUrl.startsWith('http://')) {
                    sauce.imageUrl = sauce.imageUrl.replace(/^http:/, 'https:');
                  }
                  return sauce;
                });
              }
            

  getSauces() {
    this.http.get<Sauce[]>(`${environment.apiUrl}/sauces`).pipe(
      // tap(sauces => this.sauces$.next(sauces)),
      tap(sauces => {
        const saucesWithUpdatedUrls = this.updateImageUrls(sauces);
        this.sauces$.next(saucesWithUpdatedUrls);
      }),
      catchError(error => {
        console.error(error.error.message);
        return of([]);
      })
    ).subscribe();
  }

  getSauceById(id: string) {
    return this.http.get<Sauce>(`${environment.apiUrl}/sauces/${id}`).pipe(
      catchError(error => throwError(error.error.message))
    );
  }

  likeSauce(id: string, like: boolean) {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/sauces/${id}/like`,
      { userId: this.auth.getUserId(), like: like ? 1 : 0 }
    ).pipe(
      mapTo(like),
      catchError(error => throwError(error.error.message))
    );
  }

  dislikeSauce(id: string, dislike: boolean) {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/sauces/${id}/like`,
      { userId: this.auth.getUserId(), like: dislike ? -1 : 0 }
    ).pipe(
      mapTo(dislike),
      catchError(error => throwError(error.error.message))
    );
  }

  createSauce(sauce: Sauce, image: File) {
    const formData = new FormData();
    formData.append('sauce', JSON.stringify(sauce));
    formData.append('image', image);
    return this.http.post<{ message: string }>(`${environment.apiUrl}/sauces`, formData).pipe(
      catchError(error => throwError(error.error.message))
    );
  }

  modifySauce(id: string, sauce: Sauce, image: string | File) {
    if (typeof image === 'string') {
      return this.http.put<{ message: string }>(`${environment.apiUrl}/sauces/${id}`, sauce).pipe(
        catchError(error => throwError(error.error.message))
      );
    } else {
      const formData = new FormData();
      formData.append('sauce', JSON.stringify(sauce));
      formData.append('image', image);
      return this.http.put<{ message: string }>(`${environment.apiUrl}/sauces/${id}`, formData).pipe(
        catchError(error => throwError(error.error.message))
      );
    }
  }

  deleteSauce(id: string) {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/sauces/${id}`).pipe(
      catchError(error => throwError(error.error.message))
    );
  }
}
