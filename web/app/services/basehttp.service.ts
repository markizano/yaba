import { HttpClient, HttpHeaders } from "@angular/common/http";
import { HostListener, Injectable } from "@angular/core";
import { Observable, BehaviorSubject, of, shareReplay, retry, catchError } from 'rxjs';
import { Yabables } from 'app/lib/types';
import { CACHE_EXPIRY_SECONDS } from 'app/lib/structures';

/**
 * This helped a lot in caching: https://borstch.com/blog/development/angulars-httpclient-caching-techniques
 */
@Injectable()
export abstract class BaseHttpService<Yabadaba extends Yabables> {
    headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    cacheExpiry: boolean;
    request?: Observable<Yabadaba>;

    /**
     * The cached items from the server or localStorage.
     */
    abstract cache: Yabadaba;

    /**
     * The cacheSubject is used to notify subscribers of changes to the cache.
     */
    abstract cacheSubject: BehaviorSubject<Yabadaba>;

    /**
     * The name of the service. Please keep this r'[a-z0-9_\-]+' so we can use it as a localStorage key.
     */
    abstract name: string;

    /**
     * The endpoint to fetch and save data from the server. Server can be derived from the environment if needed.
     */
    abstract endpoint: string;

    /**
     * Fetch the next value from the server and add it to the cache.
     */
    abstract next (value: Yabadaba): void;

    constructor(protected http: HttpClient) {
        console.log('new BaseHttpService()');
        this.cacheExpiry = true;
    }

    isExpired(): boolean {
        return this.cacheExpiry;
    }

    setExpire() {
        setTimeout(() => {
            this.cacheExpiry = true;
            console.debug('cache:timeout!');
        }, CACHE_EXPIRY_SECONDS * 1000);
    }

    /**
     * All the services will bind to the window and check for storage events.
     * If any events are captured, invalidate the cache so we talk to the server again.
     * Bonus points if you can send messages between tabs and only update changed records.
     */
    @HostListener('window:storage')
    onStorage($event: StorageEvent): void {
        if ( $event.key !== this.name ) return;
        console.log(`Storage event detected in ${this.constructor.name}!`);
        this.cacheExpiry = true;
    }

    /**
     * Fetch the server items saved from the server if possible.
     * If the cache is expired, fetch from the server.
     * If fetching from the server fails, attempt to work from localStorage.
     * @returns {void}
     */
    load(): Observable<Yabadaba> {
        // Loading items returns a promise so we can asynchronously process results.
        console.debug('BaseHttpService.load(): ', this.isExpired());
        if ( !this.isExpired() && this.cache.length > 0 ) {
            console.log('cache-hit: ', this.cache);
            return of(this.cache);
        }
        console.log('cache-miss and not loading: ', this.cache);
        if ( !this.request ) {
            this.request = this.http.get<Yabadaba>(this.endpoint);
        }
        return this.request.pipe(
            retry(0),
            shareReplay(100, 1000),
            catchError((err) => {
                console.warn('Error fetching data from the server:', err);
                console.log('Attempting to load from localStorage:', this.name);
                const data = localStorage.getItem(this.name);
                if (data) {
                    const cache = <Yabadaba>JSON.parse(data);
                    this.cacheSubject.next(cache);
                }
                return of(this.cache);
            })
        );
    }

    /**
     * Save the objects to the server.
     * @returns void
     */
    save(items: Yabadaba): Observable<Yabadaba> {
        // The act of setItem() will trigger the storage event in other tabs.
        localStorage.setItem(this.name, JSON.stringify(this.cache = items));
        return this.http.post<Yabadaba>(this.endpoint, this.cache, {headers: this.headers});
    }

    onCachedUpdate(): Observable<Yabadaba> {
        return this.cacheSubject.asObservable();
    }

    get(): Yabadaba {
        return this.cache;
    }

    /**
     * Clear the cache and force a reload from the server.
     */
    flush(): void {
        this.cache.length = 0;
        this.cacheExpiry = true;
    }
}
