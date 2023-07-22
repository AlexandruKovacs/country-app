import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Country } from '../interfaces/country';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Region } from '../interfaces/region.type';

@Injectable({providedIn: 'root'})
export class CountriesService {

  private apiUrl: string = 'https://restcountries.com/v3.1';

  public cacheStore: CacheStore = {
    byCapital: { term: '', countries: [] },
    byCountry: { term: '', countries: [] },
    byRegion:  { region: '', countries: [] },
  }


  constructor(private http: HttpClient) {
    this.getFromLocalStorage();
  }

  private saveToLocalStore() {
    localStorage.setItem('cacheStore', JSON.stringify(this.cacheStore));
  }

  private getFromLocalStorage() {
    if (!localStorage.getItem('cacheStore')) return;

    this.cacheStore = JSON.parse(localStorage.getItem('cacheStore')!);
  }

  private getCountrisRequest(url: string): Observable<Country[]> {
    return this.http.get<Country[]>(url)
    .pipe(
      catchError( error => {
        console.error('Error: ', error);
        return of([]);
      })
    );
  }

  searchCountryByAlphaCode(code: string): Observable<Country | null> {
    return this.http.get<Country[]>(`${this.apiUrl}/alpha/${code}`)
      .pipe(
        map( countries => countries.length > 0 ? countries[0] : null),
        catchError( () => of(null) ),
      );
  }

  searchCapital(term: string): Observable<Country[]> {
    const url = `${this.apiUrl}/capital/${term}`;
    return this.getCountrisRequest(url)
      .pipe(
        tap( countries => this.cacheStore.byCapital = { term, countries } ),
        tap( () => this.saveToLocalStore() )
      );
  }

  searchCountry(term: string): Observable<Country[]> {
    const url = `${this.apiUrl}/name/${term}`;
    return this.getCountrisRequest(url)
      .pipe(
        tap( countries => this.cacheStore.byCountry = { term, countries } ),
        tap( () => this.saveToLocalStore() )
      );
  }

  searchRegion(region: Region): Observable<Country[]> {
    const url = `${this.apiUrl}/region/${region}`;
    return this.getCountrisRequest(url)
      .pipe(
        tap( countries => this.cacheStore.byRegion = { region , countries } ),
        tap( () => this.saveToLocalStore() )
      );
  }
}

// tap( countries => console.log('Paso por el tap 1', countries)),
// map( countries => [] ),
// tap( countries => console.log('Paso por el tap 2', countries))
