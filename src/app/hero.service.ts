import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeroInterface } from './hero';
import { HEROES } from './mock-heroes';
import { Observable, of, pipe } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  getHeroes(): Observable<HeroInterface[]> {
    this.messageService.add('HeroService: fetched heroes');
    return this.http.get<HeroInterface[]>(this.heroesUrl).pipe(
      tap((_) => this.log('fetched heroes')),
      catchError(this.handleError<HeroInterface[]>('getHeroes', []))
    );
  }
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
  private heroesUrl = 'api/heroes';

  getHero(id: number): Observable<HeroInterface> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<HeroInterface>(url).pipe(
      tap((_) => this.log(`fetched hero id ${id}`)),
      catchError(this.handleError<HeroInterface>(`getHero id=${id}`))
    );

    const hero = HEROES.find((h) => h.id === id) as HeroInterface;
    this.messageService.add(`HeroService: fetched hero id=${id}`);
    return of(hero);
  }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  updateHero(hero: HeroInterface): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((_) => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  addHero(hero: HeroInterface): Observable<HeroInterface> {
    return this.http
      .post<HeroInterface>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap((newHero: HeroInterface) =>
          this.log(`added hero with id=${newHero.id}`)
        ),
        catchError(this.handleError<HeroInterface>('addHero'))
      );
  }

  deleteHero(hero: HeroInterface | number): Observable<HeroInterface> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<HeroInterface>(url, this.httpOptions).pipe(
      tap((_) => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<HeroInterface>('deleteHero'))
    );
  }

  searchHeroes(term: string): Observable<HeroInterface[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http
      .get<HeroInterface[]>(`${this.heroesUrl}/?name=${term}`)
      .pipe(
        tap(
          (x) =>
            x.length
              ? this.log(`found heroes matching "${term}"`)
              : this.log(`no heroes matching "${term}"`),
          catchError(this.handleError<HeroInterface[]>('search Heroes', []))
        )
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
