import { Injectable } from '@angular/core';
import { IInstitution, Institutions } from 'app/lib/institutions';
import { Storables } from 'app/lib/structures';

@Injectable({
  providedIn: 'root'
})
export class InstitutionsService implements Storables {
  protected institutions?: Institutions;
  constructor() {
    this.institutions = new Institutions();
  }

  public save(): void {
    localStorage.setItem('institutions', JSON.stringify(this.institutions));
  }

  public load(): void {
    const userInstitutions = localStorage.getItem('institutions');
    if ( userInstitutions ) {
      this.institutions?.push(...<Institutions>JSON.parse(userInstitutions));
    }
  }

  public getInstitutions(): Institutions {
    return this.institutions || new Institutions();
  }

  public add(institution: IInstitution): void {
    this.institutions?.push(institution);
  }

  public remove(institution: IInstitution): void {
    this.institutions?.remove(institution);
  }

  public update(institution: IInstitution): void {
    this.institutions?.byId(institution.id)?.update(institution);
  }
}
