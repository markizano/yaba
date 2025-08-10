import { EventEmitter } from 'events';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as uuid from 'uuid';

/**
 * @enum {StorageAction} The actions that can be taken on the storage.
 */
export enum StorageAction {
    SET = 'set',
    REMOVE = 'remove',
    CLEAR = 'clear',

}

/**
 * @interface {StorageUpdateEvent} The event that is emitted when the storage is updated.
 */
export interface StorageUpdateEvent {
    action: StorageAction;
    key: string;
    value: SessionData;
}

/**
 * @interface {Storable} The interface for a storage backend.
 * This can be sessionStorage, localStorage or a custom implementation that talks to a remote api.
 */
export interface Storable {
    [key: string]: unknown;
    getItem(name: string): unknown|Promise<unknown>;
    setItem(name: string, value: unknown): void;
    removeItem(name: string): void;
    clear(): void;
}

/**
 * @class {SessionMetadata} The metadata for a session.
 */
export class SessionMetadata {
    id: string;
    ipAddress: string;
    username?: string;
    serverId: string;

    constructor(id?: string, ipAddress?: string, username?: string, serverId?: string) {
        this.id = id ?? uuid.v4();
        this.ipAddress = ipAddress ?? '';
        this.username = username ?? '';
        this.serverId = serverId ?? '';
    }

    toString(): string {
        return JSON.stringify({id: this.id, ipAddress: this.ipAddress, username: this.username, serverId: this.serverId});
    }

    static fromString(str: string): SessionMetadata {
        return ((obj) => new SessionMetadata(obj.id, obj.ipAddress, obj.username))(JSON.parse(str));
    }
}

/**
 * @class {SessionData} The internal data structure for a session.
 */
export class SessionData {
    [key: string]: unknown;
    protected _metadata: SessionMetadata = new SessionMetadata();

    toString(): string {
        return JSON.stringify(this);
    }

    /**
     * Load the session data from storage.
     * @param storage {Storable}
     */
    static fromStorage(id: string, storage: Storable): SessionData {
        console.log('Loading session data from storage...')
        const sessionStr = <string>storage.getItem(id) || '';
        const result = new SessionData();
        if ( sessionStr ) {
            try {
                (JSON.parse(sessionStr) as Array<unknown>).forEach((value, key) => {
                    result[key] = value;
                });
                console.log(`Found session storage for id ${id}`);
            } catch (e) {
                console.error(`Error loading session data from storage: ${e}`);
            }
        }
        return result;
    }

    /**
     * @Factory method to get a SessionData object from an object.
     * @param {string} obj The object to convert to a SessionData object.
     * @returns {SessionData} An instance parsed from the object.
     */
    static fromObject(obj: string): SessionData {
        const result = new SessionData();
        const session = JSON.parse(obj);
        for ( const key in session ) {
            result[key] = session[key];
        }
        return result;
    }

    get metadata(): SessionMetadata {
        return this._metadata;
    }
    set metadata(metadata: SessionMetadata) {
        this._metadata = metadata;
    }

    get id(): string {
        return this._metadata.id;
    }
    set id(id: string) {
        this._metadata.id = id;
    }

    get ipAddress(): string {
        return this._metadata.ipAddress;
    }
    set ipAddress(ipAddress: string) {
        this._metadata.ipAddress = ipAddress;
    }

    get username(): string {
        return this._metadata.username || '';
    }
    set username(username: string) {
        this._metadata.username = username;
    }

}

/**
 * Service for managing sessions.
 * Allows for setting the backend for session management. Supports
 * - localStorage
 * - sessionStorage
 * - server-api (very crude framework)
 *
 * Enables the getting and setting of data for a given session.
 */
@Injectable({
    providedIn: 'root',
})
export class SessionManagementService extends EventEmitter {
    protected storageBackend: Storable;
    #data: SessionData;

    constructor(protected http: HttpClient) {
        super();
        this.storageBackend = localStorage;
        this.#data = new SessionData();
        this.setupStorageEventListener();
        this.getServerSession(http).then((sess: unknown) => ((session: SessionMetadata) => {
            const metadata = new SessionMetadata(session.id, session.ipAddress, session.username, session.serverId);
            this.#data.id = metadata.id;
            this.#data.ipAddress = metadata.ipAddress;
        })(sess as SessionMetadata), (error) => {
            console.error(`Error getting session from server: ${error}`);
        });
        this.on('changed', (e) => this.storageHandler(e));
        this.on('window-session', (e) => this.storageHandler(e));
    }

    protected storageHandler (event: StorageUpdateEvent): void {
        switch(event.action) {
            case StorageAction.SET:
                this.storageBackend.setItem(event.key, event.value.toString());
                break;
            case StorageAction.REMOVE:
                this.storageBackend.removeItem(event.key);
                break;
            case StorageAction.CLEAR:
                this.storageBackend.clear();
                break;
        }
    }


    async getServerSession(http: HttpClient): Promise<string> {
        return firstValueFrom(http.get<string>(`/api/session`, {headers: {'Content-Type': 'application/json'}} )).then((session: string) => {
            return session;
        }, (error) => {
            console.error(`Error getting session from server: ${error}`);
            return '';
        });
    }

    setStorageBackend(backend: Storable): SessionManagementService {
        this.storageBackend = backend;
        return this;
    }

    getItem<T>(name: string, elseValue?: T): T {
        return this.#data && name in this.#data ? <T>this.#data[name]: <T>elseValue;
    }

    setItem(name: string, value: unknown): void {
        this.#data[name] = value;
        this.emit('changed', {action: StorageAction.SET, key: name, value: value});
    }

    removeItem(name: string): void {
        delete this.#data[name];
        this.emit('changed', {action: StorageAction.REMOVE, key: name, value: undefined as unknown as SessionData});
    }

    clear(): void {
        this.#data = new SessionData();
        this.emit('changed', {action: StorageAction.CLEAR, key: '', value: undefined as unknown as SessionData});
        this.emit('clear');
    }

    protected setupStorageEventListener(): void {
        // Load session data from other tabs when they save data too.
        window.addEventListener('storage', (event: StorageEvent) => {
            this.emit('window-session', {action: StorageAction.SET, key: event.key, value: event.newValue});
        });
    }

    protected getSessionsFromStorage(): string[] {
        const sessionsInStorage = <string>this.storageBackend.getItem('sessions') || '[]';
        return sessionsInStorage ? JSON.parse(sessionsInStorage) : [];
    }

    protected save(): void {
        this.storageBackend.setItem('session', this.#data.toString());
        this.emit('changed', {action: StorageAction.SET, key: 'session', value: this.#data});
    }
}
