import { HttpClient, HttpHeaders } from "@angular/common/http";
import { EventEmitter, HostListener, Injectable } from "@angular/core";
import { Observable, of, retry, Observer, Subscription } from 'rxjs';
import { Yabables } from 'app/lib/types';
import { CACHE_EXPIRY_SECONDS } from 'app/lib/constants';

/**
 * This helped a lot in caching: https://borstch.com/blog/development/angulars-httpclient-caching-techniques
 * 
 */
@Injectable()
export abstract class BaseHttpService<Yabadaba extends Yabables> {
    headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    cacheExpiry = true;

    /**
     * The cached items from the server or localStorage.
     */
    protected abstract cache: Yabadaba;

    /**
     * The cacheSubject is used to notify subscribers of changes to the cache.
     */
    protected abstract cacheSubject: EventEmitter<Yabadaba>;

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

    constructor(protected http: HttpClient) { }

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
        // console.debug('BaseHttpService.load(): ', this.isExpired());
        if ( !this.isExpired() && this.cache.length > 0 ) {
            // console.log('cache-hit: ', this.cache);
            return of(this.cache);
        }
        // console.log('cache-miss and not loading: ', this.cache);
        const next = (value: Yabadaba) => this.next(value);
        const error = (err: unknown) => {
            console.warn('Error fetching data from the server:', err);
            try {
                console.log('Attempting to load from localStorage:', this.name);
                const data = localStorage.getItem(this.name);
                if (data) {
                    const cache = JSON.parse(data);
                    console.log('Loaded from localStorage:', this.name, cache)
                    this.next(<Yabadaba>cache);
                }
            } catch(e) {
                console.error('Error loading from localStorage:', e);
            }
            return of(this.cache);
        };
        const complete = () => sub.unsubscribe();
        const fetchable = <Observer<Yabadaba>>{next, error, complete};
        const sub = this.http.get<Yabadaba>(this.endpoint)
          .pipe(retry(0))
          .subscribe(fetchable);
        return of(this.cache);
    }

    /**
     * Save the objects to the server.
     * @returns {Observable<Yabadaba>} Fire and forget save post.
     */
    save(items: Yabadaba): Observable<Yabadaba> {
        // The act of setItem() will trigger the storage event in other tabs.
        this.next(items);
        localStorage.setItem(this.name, JSON.stringify(items));
        this.cacheExpiry = false;
        console.debug('BaseHttpService.save(): ', this.name, this.cache);
        return this.http.post<Yabadaba>(this.endpoint, this.cache, {headers: this.headers});
    }

    /**
     * Subscribe to updates on the cache.
     * @param subscription {Partial<Observer<Yabadaba>> | ((value: Yabadaba) => void)} Subscription to the cache.
     * @returns {Subscription} The subscription object.
     */
    subscribe(subscription: Partial<Observer<Yabadaba>> | ((value: Yabadaba) => void)): Subscription {
        return this.cacheSubject.subscribe(subscription);
    }

    /**
     * Refresh the cache from the server.
     */
    refresh() {
        this.load().subscribe((value) => this.next(value));
    }

    /**
     * Clear the cache and force a reload from the server.
     */
    flush(): void {
        this.cache.clear();
        this.cacheExpiry = true;
    }

    /**
     * Run me inside a subscribe function to get the last cached object.
     */
    get(): Yabadaba {
        if ( this.isExpired() ) {
            this.refresh();
        }
        return this.cache;
    }
}
