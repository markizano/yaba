import { Subscription } from 'rxjs';

import { Component, OnInit, OnDestroy, forwardRef, inject, ElementRef, AfterViewInit } from '@angular/core';
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
  availableTags: Tags = new Tags();
  selectedTags: Tags = new Tags();

  ref: ElementRef = inject(ElementRef);

  budgetsService = inject(BudgetsService);
  #bud?: Subscription;

  multiple: boolean = false;
  required: boolean = false;

  // ControlValueAccessor implementation
  onChange = (value: Tags) => {};
  onTouched = () => {};

  ngOnInit(): void {
    // Subscribe to budget updates using the subscribe method
    this.#bud = this.budgetsService.subscribe((tags: Tags) => {
      this.availableTags = tags;
    });
  }

  ngOnDestroy(): void {
    if (this.#bud) {
      this.#bud.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.multiple = this.ref.nativeElement.hasAttribute('multiple');
    this.required = this.ref.nativeElement.hasAttribute('required');
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
    // Handle disabled state if needed
  }

  onTagsChange(tags: Tags): void {
    this.selectedTags = tags;
    this.onChange(tags);
    this.onTouched();
  }
}
