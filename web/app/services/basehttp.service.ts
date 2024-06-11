import { HttpClient, HttpHeaders } from "@angular/common/http";
import { HostListener, Injectable } from "@angular/core";

export interface iStorables<T> {
    load(): Promise<T>;
    save(): void;
}

@Injectable()
export abstract class BaseHttpService<T, Type extends Array<T>> {
    protected _headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    protected _cache: Type;
    protected _cacheExpiry: boolean;

    abstract getEndpoint(): string;
    abstract name: string;

    constructor(protected http: HttpClient) {
        console.log('new BaseHttpService()');
        this._cache = [] as unknown as Type;
        this._cacheExpiry = true;
    }

    /**
     * All the services will bind to the window and check for storage events.
     * If any events are captured, invalidate the cache so we talk to the server again.
     * Bonus points if you can send messages between tabs and only update changed records.
     */
    @HostListener('window:storage')
    onStorage(): void {
        console.log(`Storage event detected in ${this.constructor.name}!`);
        this._cacheExpiry = true;
    }

    protected isExpired(): boolean {
        return this._cacheExpiry;
    }

    /**
     * Fetch the server items saved from the server.
     * If the cache is expired, fetch from the server.
     * If fetching from the server fails, attempt to load from localStorage.
     * @returns Promise<T>
     */
    load(): Promise<Type> {
        const result = [] as unknown as Type;
        return new Promise<Type>((resolve: (value: Type) => void, reject: (error: unknown) => void) => {
            console.debug('BaseHttpService.load(): ', this.isExpired());
            if ( this.isExpired() ) {
                const request = this.http.get<Type>(this.getEndpoint(), {headers: this._headers});
                this._cache.length = 0;
                const aggregate = (x: Type) => {
                    result.push(...x);
                    this._cache.push(...x);
                }
                const tryLocalStorage = (e: unknown) => {
                    console.error('Error fetching from server: ', e);
                    console.log('Attempting to load from localStorage.');
                    try {
                        const cached = localStorage.getItem(this.name) ?? '';
                        if ( cached ) {
                            this._cache.length = 0;
                            (c => {
                                this._cache.push(...c);
                                result.push(...c);
                            })(JSON.parse(cached));
                        }
                        console.log('Loaded from localStorage: ', this._cache);
                        this._cacheExpiry = false;
                        resolve(result);
                    } catch (e) {
                        console.error('Error loading from localStorage: ', e);
                        reject(e);
                    }
                };
                request.subscribe({next: aggregate, error: tryLocalStorage, complete: () => resolve(result)});
            } else {
                return resolve(this._cache);
            }
        });
    }

    /**
     * Save the institutions to the server.
     * @returns void
     */
    save(): void {
        localStorage.setItem(this.name, JSON.stringify(this._cache));
        this.http.post(this.getEndpoint(), this._cache, {headers: this._headers}).subscribe({
            next: (i: unknown) => console.log('next:saved(): ', i),
            complete: () => console.log('complete:saved()'),
            error: (error: unknown) => console.error('Error saving: ', error),
        });
    }

}
