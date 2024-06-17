import { EventEmitter } from 'events';

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { HostListener, Injectable } from "@angular/core";
import { Observable, Subscription } from 'rxjs';
import { Yabables } from 'app/lib/types';
import { CACHE_EXPIRY_SECONDS } from 'app/lib/structures';

@Injectable()
export abstract class BaseHttpService<Yabadaba extends Yabables> {
    headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    abstract cache: Yabadaba;
    cacheExpiry: boolean;
    request?: Observable<Yabadaba>;
    event: EventEmitter = new EventEmitter();

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
        this.event = new EventEmitter();
        this.onExpire();
        this.onClear();
    }

    isExpired(): boolean {
        return this.cacheExpiry;
    }

    /**
     * All the services will bind to the window and check for storage events.
     * If any events are captured, invalidate the cache so we talk to the server again.
     * Bonus points if you can send messages between tabs and only update changed records.
     */
    @HostListener('window:storage')
    onStorage(): void {
        console.log(`Storage event detected in ${this.constructor.name}!`);
        this.cacheExpiry = true;
    }

    onExpire(): void {
        this.event.on('expire', () => this.cacheExpiry = true);
    }

    onClear() {
        this.event.on('clear', () => this.flush());
    }

    setExpire() {
        setTimeout(() => {this.cacheExpiry = true; console.debug('cache:timeout!');}, CACHE_EXPIRY_SECONDS * 1000);
    }

    /**
     * Register your loaded function with loaded before calling load().
     * This will allow you to process the results of the load() function when it comes back.
     * @param {Function} callback method with a single argument containing the results of the api call to the server (or results from local storage.)
     */
    loaded(callback: (result: Yabadaba) => void): void {
        this.event.on('loaded', callback);
    }

    /**
     * Fetch the server items saved from the server if possible.
     * If the cache is expired, fetch from the server.
     * If fetching from the server fails, attempt to work from localStorage.
     * @returns {void}
     */
    load(): void {
        // Loading items returns a promise so we can asynchronously process results.
        console.debug('BaseHttpService.load(): ', this.isExpired());
        if ( !this.isExpired() ) {
            console.log('cache-hit: ', this.cache);
            this.event.emit('loaded', this.cache);
            return;
        }
        if ( this.request === undefined ) {
            console.log('cache-miss and not loading: ', this.cache);
            this.event.emit('clear');
            this.request = this.http.get<Yabadaba>(this.endpoint);
            const sub: Subscription = this.request.subscribe({
                next: (x: Yabadaba) => this.next(x),
                error: (e: unknown) => this.tryLocalStorage(e, sub),
                complete: () => this.complete(sub)
            });
        } else {
            console.log('cache-miss and loading: ', this.cache);
        }
    }

    complete(sub: Subscription): void {
        console.log('complete:load()');
        sub.unsubscribe();
        this.request = undefined;
        this.cacheExpiry = false;
        this.setExpire();
        this.event.emit('loaded', this.cache);
    }

    /**
     * Attempt to load from local storage if the server fails.
     */
    tryLocalStorage(e: unknown, sub: Subscription): void {
        console.log('Attempting to load from localStorage.');
        try {
            const cached = localStorage.getItem(this.name) ?? '';
            if ( cached ) {
                const parsed = JSON.parse(cached);
                this.cache.add(...parsed);
            }
            console.log('Loaded from localStorage: ', this.cache);
            this.cacheExpiry = false;
            sub.unsubscribe();
            this.request = undefined;
            this.event.emit('loaded', this.cache)
        } catch (ex) {
            console.error('Error loading from localStorage: ', e);
            sub.unsubscribe();
            this.request = undefined;
            this.event.emit('error', new Error('Error loading from localStorage: ' + ex, {cause: e}));
        }
    }

    /**
     * Save the objects to the server.
     * @returns void
     */
    save(items: Yabadaba): void {
        // The act of setItem() will trigger the storage event in other tabs.
        this.event.emit('save', items);
        localStorage.setItem(this.name, JSON.stringify(this.cache = items));
        const sub = this.http.post(this.endpoint, this.cache, {headers: this.headers}).subscribe({
            next: (i: unknown) => console.log('next:saved(): ', i),
            complete: () => {
                console.log('complete:saved()');
                sub.unsubscribe()
                this.event.emit('saved', this.cache);
            },
            error: (error: unknown) => console.error('Error saving: ', error),
        });
    }

    /**
     * Clear the cache and force a reload from the server.
     */
    flush(): void {
        this.cache.length = 0;
        this.cacheExpiry = true;
    }
}
