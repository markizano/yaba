import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, inject, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Institution, Institutions } from "app/lib/institutions";
import { InstitutionsService } from "app/services/institutions.service";
import { Subscription } from "rxjs";

/**
 * NgSelect front for selecting institution(s).
 */
@Component({
  selector: 'yaba-institution-select',
  templateUrl: './institution-selector.html',
  standalone: false,
  providers: [{ // Enables the use of [(ngModel)] to be passed to this component. (Binds to institutionId)
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InstitutionSelectorComponent),
    multi: true
  }]
})
export class InstitutionSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor, AfterViewInit {
  @Input() value: string = '';

  // ControlValueAccessor implementation
  // Outputs a string=institutionId
  onChange = (_: string) => {};
  onTouched = () => {};
  disabled: boolean = false;

  multiple: boolean = false;
  required: boolean = false;

  institutions: Institutions = new Institutions();
  #sub?: Subscription;

  institutionsService: InstitutionsService = inject(InstitutionsService);
  ref: ElementRef = inject(ElementRef);

  ngOnInit() {
      const update = (institutions: Institutions) => {
          this.institutions = institutions;
      }
      update(this.institutionsService.get());
      this.#sub = this.institutionsService.subscribe(update);
  }

  ngOnDestroy() {
      this.#sub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.multiple = this.ref.nativeElement.classList.contains('multiple');
    this.required = this.ref.nativeElement.hasAttribute('required')
  }

  /* BEGIN: [(ngModel)] handler methods */
  writeValue(value: string): void {
      this.value = value;
  }

  registerOnChange(fn: any): void {
      this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
      this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
  }
  /* END: [(ngModel)] handler methods */

  /**
   * Handle change events from the ng-select component
   * @param institution The selected institution
   */
  changed(institution: Institution): void {
      this.value = institution?.id || '';
      this.onChange(this.value);
      this.onTouched();
  }
}
