import { Component, Input } from '@angular/core';

const boxDimensionsCss = `background-size: 32px;
width: 32px;
height: 32px;
padding: 0px;
margin: 8px;
display: inline-block;
cursor: pointer;`;

const hover = `:host:hover { cursor: grab }`;

@Component({
  selector: 'actions',
  template: '',
  styleUrls: ['./controls.component.css'],
})
export class ActionsComponent { }

@Component({
  selector: 'add',
  template: '',
  styles: [ `:host {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAAGFBMVEVhcABT3kdk3mFt3mlu32p44nWA4338//u9xAiZAAAAAXRSTlMAQObYZgAAAM1JREFUSMe91s0NgzAMBWB7A78TZ0boCB2hI3SEnLI+KkjNjx07ohRf88UKEfhBVBf2olHhW9G6KRhNibvf6gH4gjWQYL0VMMtqsOScjBb1es5v1aI0+KwbLTqQFcAIQD1jD2QOYAzQ36ICcgmABzAB2AdyByjvQV+v45TVzr4KWE6CNQLP/4PHz4eMLipVYPBl7YB9IHcA8gFNAPaAXALIA+YASdGEUYDG4OScNGZxO4qNac72tJf5OIgDJYykONTiWIyDNYzmiXC3fw82l6MakgvgjQcAAAAASUVORK5CYII=');
      ${boxDimensionsCss} }`,
    hover,
 ],
})
export class AddComponent { }

@Component({
  selector: 'close',
  template: '',
  styles: [ ` :host {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAAFVBMVEVvcm3/AAD/9vb/+vr//Pz//v7///+vlWMoAAAAAXRSTlMAQObYZgAAAOZJREFUSMfllUEWwiAMRNsbMOgFqj72bnoPNx6g+rj/ESxtqbQhjFVXyiKbfCYhhFBV/7hqwBTcmBbzawRQJoAyUS8BQwSkxNovJASAYgZSAihL1DnAbAEAEoMBMYJrgrWdiDEB1g8u55s1EAV8cFnvLzrQRbtMAjFELzEYBRg2JwISCLsTAcg6uuDvRC2fgF0IZAC0qYCicC8BpxDirAO2zSc5H3PXB8gd8+VC0VLTy9rH6260hrmODXPTABzHljvItv64q7/wsujj5c+fDhApYbYOMT4G6SDlo5gP8zkP8/6H8rvrAYleX2kwKGFPAAAAAElFTkSuQmCC');
      position: absolute;
      top: 10px;
      right: 10px;
      ${boxDimensionsCss}
    }`,
    hover
  ],
})
export class CloseComponent { }

@Component({
  selector: 'debug',
  template: '',
  styles: [],
})
export class DebugComponent { }

@Component({
  selector: 'edit',
  template: '',
  styles: [`:host {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAACVBMVEUAAAAAAAD///+D3c/SAAAAAXRSTlMAQObYZgAAAN5JREFUOMvNk7sBBCEIBTGwg6OfTS4ngP5bOeEh4lZwJurIDn5Yoj9s9tzzabpXzLxjdL6CkRHjG0bkUJoAO1BpBBgCwJbDjCPj5wJDpwBwKmQoHAlWSkPwh3YuRr7axdphA1MAC/iupzRgCTeI6DyDvhQATQHQFAG6IkBXBOgK0pfCwaVwcCkcXAoHl2KBUuzj+8UEPOCBosCahWIDXvFGHZBhFwfwV24wUU0HjP4iut5u9hf5eHH1F+FddERSAPOspVnHzNG5iKqlKu1XXysrK5rQKe1oZc8Q/adf9Qd5Bzj5jcKSOAAAAABJRU5ErkJggg==');
      filter: invert(100%);
      /* Filter impacts the border too somehow... */
      border: 1px solid black;
      ${boxDimensionsCss}
    }`,
    hover
  ],
})
export class EditComponent { }

@Component({
  selector: 'inspect',
  template: '',
  styles: [ `:host {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAQMAAACQp+OdAAAABlBMVEWFY1UAAADJW86pAAAAAXRSTlMAQObYZgAAAJJJREFUKM/FkLsRxCAMROW5QOGV4FIozS7NpagEQgLGeyuYWQLnPgXwBrSrj9mfovR5f4BrwA60AQdw572BcRI8IQhfhKOmGOeGPnLNRnYeBSnq45u+LT0vqqsHlVTXvfHga5Tu/C8TOm3iuJ0eAkzAgmeO5DJUCRVVG2rMErLv1bzG0YAaWUvQWtaitDot8/34AewUoP8HNfvLAAAAAElFTkSuQmCC');
    filter: invert(100%);
    ${boxDimensionsCss}
  }`]
})
export class InspectComponent { }

@Component({
  selector: 'question',
  template: '',
  styles: [ `:host {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAAD1BMVEUAAABMTEzh4eHi4uLj4+N3SbafAAAAAXRSTlMAQObYZgAAAQ9JREFUSMeV1esVgyAMBWDYINAJwAmU/XdrtRDIC5BfHvP1hlJrnBuWD89yxqplkwx1VZC6IlhdiF7Puqg341FKudJzDUpALP+VRASt1wwQAUdBwSJ6wJVzRgByB1eDdBcBO6R2QSI8gotGtYgG8PYdMYKAnzt5M2Ag1csPAX4CwhYI4m7fw9OjgZjxl8ZvcQPxpIwncvdQQD8oA/QtbIF5h98u5wEayGOAAvrjYoCDBOggzUCkARKwABWEKWAdBIgb4HwL/By4tyDIV9USuGkddoBfdFgD0uP390qsAwP0HEC8phlwe8CZAOQooIC/6zkAe5qIiWEe8zRCmzhWgBrxcuqt5+Z68q5n93r66+sLE3R/bdcNfTUAAAAASUVORK5CYII=');
    ${boxDimensionsCss}
  }`]
})
export class QuestionComponent { }

@Component({
  selector: 'save',
  template: '',
  styles: [`:host {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAACVBMVEUAAAAAAAD///+D3c/SAAAAAXRSTlMAQObYZgAAAIBJREFUOMvl0zEOgCAMhWE69Ajch8Xdgd7/KgKt9NnEhIXExC6ab/gTsKa0ZVjuKQp5whmhRhCDwuNdDosMqP1pEYdcA7AEII04JI0AaARAIwAaAdAIwogg8Dv0wzUgB72wZaB5Xwb+Bb4ONBfkebi2IOtgu8R/AIFZA0Y49/zoF6YJcMkbWlfuAAAAAElFTkSuQmCC');
      ${boxDimensionsCss}
    }`,
    hover
  ],
})
export class SaveComponent { }

@Component({
  selector: 'trash',
  template: '',
  styles: [`:host {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAACVBMVEUAAAAAAAD///+D3c/SAAAAAXRSTlMAQObYZgAAAJ1JREFUOMu909ENxCAIAFD8YAT2cQQ+YP9VDmyJEK+NaS9H/HohiAYARpCqQIqmFj0BOnACcpBbsHQsYAXbNowWZvQVsAKvGVBhVJ23jQc+BGvHzgmg3jWy938kq7/cgfehB7SAKPpbUAcNoAnyGDgAXwAcANuAE/gaOp5XfQcJoH+CfRw5yBj5C0CfMU6QtqTMpe5DXo4tgLI+C3wAPtZ/2wH5BkcAAAAASUVORK5CYII=');
    filter: invert(100%);
    border: 1px solid black; /* Filter impacts the border too somehow... */
    ${boxDimensionsCss} }`,
  hover
  ],
})
export class TrashComponent { }

@Component({
  selector: 'settings',
  template: '',
  styles: [`:host {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAARklEQVRIx+2TMQoAMAgDE+n/v2z3Cu1g3S6jQ46A58zUZELDAfDMqifbncbja+Jve22IO7+/wHiAB3iAB3iAB3gAAIAkaQOM6Sc3a6WnTQAAAABJRU5ErkJggg==');
      border: 1px solid black;
      ${boxDimensionsCss}
    }`,
    hover
  ],
})
export class SettingsComponent { }

@Component({
    selector: 'yaba-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: [ './pagination.component.css' ],
})
export class PaginationComponent {
    title = 'Pagination';
    @Input() itemCount = 0;
    itemsPerPage = 0;
    offset = 0;
    page = 0;
    pageCount = 1;

    constructor() {
        this.refresh();
    }

    setPage($page: number) {
        if ( $page < 0 || $page > this.pageCount -1 ) return;
        this.page = $page;
        this.offset = $page * this.itemsPerPage;
    }

    previous() {
        this.setPage(this.page -1);
    }

    proximo() {
        this.setPage(this.page +1);
    }

    refresh() {
        this.pageCount = Math.round( this.itemCount / this.itemsPerPage );
        if ( this.itemCount >= this.itemsPerPage ) {
            this.pageCount += 1;
        }
        this.setPage(0);
    }

    keyNavigate($event: KeyboardEvent) {
        // Right
        if ( $event.key == 'ArrowRight' ) {
            $event.preventDefault();
            this.proximo();
        // Left
        } else if ( $event.key == 'ArrowLeft') {
            $event.preventDefault();
            this.previous();
        }
    }
}
