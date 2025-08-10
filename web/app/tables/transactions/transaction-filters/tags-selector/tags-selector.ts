import { Subscription } from 'rxjs';

import { Component, OnInit, OnDestroy, forwardRef, inject, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Tags } from 'app/lib/types';
import { BudgetsService } from 'app/services/budgets.service';

@Component({
  selector: 'yaba-tags',
  templateUrl: './tags-selector.html',
  styleUrls: ['./tags-selector.css'],
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagsSelectorComponent),
      multi: true
    }
  ]
})
export class TagsSelectorComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  // The one place we use this as an array because of ng-select.
  // ng-select expects an array bound to [items]
  tags: string[] = [];
  selectedTags: Tags = new Tags();

  ref: ElementRef = inject(ElementRef);
  chDet: ChangeDetectorRef = inject(ChangeDetectorRef);

  budgetsService = inject(BudgetsService);
  #bud?: Subscription;

  multiple: boolean = false;
  required: boolean = false;
  disabled: boolean = false;

  // ControlValueAccessor implementation
  onChange = (value: Tags) => {};
  onTouched = () => {};

  ngOnInit(): void {
    // Subscribe to budget updates using the subscribe method
    const update = (tags: Tags) => {
      this.tags = tags.toArray();
    };
    update(this.budgetsService.get());
    this.#bud = this.budgetsService.subscribe(update);
  }

  ngOnDestroy(): void {
    this.#bud?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.multiple = this.ref.nativeElement.hasAttribute('multiple');
    this.required = this.ref.nativeElement.hasAttribute('required');
    this.chDet.detectChanges();
  }

  // ControlValueAccessor methods
  writeValue(value: Tags): void {
    this.selectedTags = value || new Tags();
  }

  registerOnChange(fn: (value: Tags) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onTagsChange(tags: string[]): void {
    console.log('TagsSelectorComponent.onTagsChange()', tags);
    this.selectedTags = new Tags(tags);
    this.onChange(this.selectedTags);
    this.onTouched();
  }
}
