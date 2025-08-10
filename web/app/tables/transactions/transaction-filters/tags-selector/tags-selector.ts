import { Component, OnInit, OnDestroy, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

import { BudgetsService } from 'app/services/budgets.service';
import { Tags } from 'app/lib/types';

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
export class TagsSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  availableTags: Tags = new Tags();
  selectedTags: Tags = new Tags();

  private budgetsService = inject(BudgetsService);
  private subscription?: Subscription;

  // ControlValueAccessor implementation
  onChange = (value: Tags) => {};
  onTouched = () => {};

  ngOnInit(): void {
    // Subscribe to budget updates using the subscribe method
    this.subscription = this.budgetsService.subscribe((tags: Tags) => {
      this.availableTags = tags;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ControlValueAccessor methods
  writeValue(value: Tags): void {
    this.selectedTags = value || [];
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
