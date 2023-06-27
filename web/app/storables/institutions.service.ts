import { Injectable } from '@angular/core';
import { IInstitution, Institutions } from 'app/lib/institutions';
import { Storables } from 'app/lib/structures';

@Injectable({
  providedIn: 'root'
})
export class InstitutionsService implements Storables {
  protected _instance?: Institutions;
  constructor() {
    this._instance = new Institutions();
  }

  public save(): void {
    localStorage.setItem('institutions', JSON.stringify(this._instance));
  }

  public load(): void {
    const userInstitutions = localStorage.getItem('institutions');
    if ( userInstitutions ) {
      this._instance?.push(...<Institutions>JSON.parse(userInstitutions));
    }
  }

  public getInstitutions(): Institutions {
    return this._instance || new Institutions();
  }

  public add(institution: IInstitution): void {
    this._instance?.push(institution);
  }

  public remove(institution: IInstitution): void {
    this._instance?.remove(institution);
  }

  public update(institution: IInstitution): void {
    this._instance?.byId(institution.id)?.update(institution);
  }
}
