import { EventEmitter } from 'events';

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { HostListener, Injectable } from "@angular/core";
import { Subscription } from 'rxjs';
import { Yabables } from 'app/lib/types';

@Injectable()
export abstract class BaseHttpService<Yabadaba extends Yabables> {
    headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    abstract cache: Yabadaba;
    cacheExpiry: boolean;
    sub?: Subscription;
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
        this.load();
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

    on(event: string, listener: (value: unknown) => void): EventEmitter {
        return this.event.on(event, listener);
    }

    emit(event: string, value?: unknown): boolean {
        return this.event.emit(event, value);
    }

    isExpired(): boolean {
        return this.cacheExpiry;
    }

    /**
     * Fetch the server items saved from the server if possible.
     * If the cache is expired, fetch from the server.
     * If fetching from the server fails, attempt to work from localStorage.
     * @returns Promise<Yabadaba>
     */
    load(): Promise<Yabadaba> {
        // Loading items returns a promise so we can asynchronously process results.
        return new Promise<Yabadaba>((resolve: (value: Yabadaba) => void, reject: (error: unknown) => void) => {
            console.debug('BaseHttpService.load(): ', this.isExpired());
            if ( !this.isExpired() ) {
                console.log('cache-hit: ', this.cache);
                return resolve(this.cache);
            }
            if ( this.sub == undefined ) {
                console.log('cache-miss and not loading: ', this.cache);
                this.clear();
                const request = this.http.get<Yabadaba>(this.endpoint, {headers: this.headers});
                this.sub = request.subscribe({
                    next: (x: Yabadaba) => this.next(x),
                    error: (e: unknown) => this.tryLocalStorage(e, resolve, reject),
                    complete: () => this.complete(resolve)
                });
            } else {
                console.log('cache-miss and loading: ', this.cache);
                this.on('loaded', () => resolve(this.cache));
            }
        });
    }

    complete(resolve: (value: Yabadaba) => void): void {
        console.log('complete:load()');
        resolve(this.cache);
        this.emit('loaded');
        this.sub?.unsubscribe();
        this.sub = undefined;
    }

    clear(): void {
        try {
            this.cache.clear();
            this.event.emit('clear');
        } catch(e) {
            console.warn('Error clearing cache: ', this.cache, e);
        }
    }

    error (e: Error, reject: (error: unknown) => void ): void {
        console.warn('Error fetching from server: ', e);
        this.sub?.unsubscribe();
        this.sub = undefined;
        return reject(e);
    }

    /**
     * Attempt to load from local storage if the server fails.
     */
    tryLocalStorage(e: unknown, resolve: (value: Yabadaba) => void, reject: (error: unknown) => void): void {
        console.log('Attempting to load from localStorage.');
        try {
            const cached = localStorage.getItem(this.name) ?? '';
            if ( cached ) {
                const parsed = JSON.parse(cached);
                this.cache.add(...parsed);
            }
            console.log('Loaded from localStorage: ', this.cache);
            this.cacheExpiry = false;
            resolve(this.cache);
        } catch (ex) {
            const fail = new Error('Error loading from localStorage: ' + ex);
            console.error('Error loading from localStorage: ', e);
            this.error(fail, reject);
        }
    }

    // I don't understand how this is different from load() above yet, but I did it anyways...
    async get(): Promise<Yabadaba> {
        if ( this.isExpired() ) {
            await this.load();
        }
        return this.cache;
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
                this.event.emit('saved');
                sub.unsubscribe(); },
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
