import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { InstitutionsComponent } from 'app/pages/institutions/institutions';
import { InstitutionsModule } from './institutions.module';
import { InstitutionsService } from 'app/services/institutions.service';
import { Institutions, Institution, InstitutionMapping, MapTypes } from 'app/lib/institutions';

describe('InstitutionsComponent', () => {
  let component: InstitutionsComponent;
  let fixture: ComponentFixture<InstitutionsComponent>;
  let mockInstitutionsService: jasmine.SpyObj<InstitutionsService>;
  let mockInstitutions: Institutions;

  beforeEach(async () => {
    // Create mock institutions service
    mockInstitutionsService = jasmine.createSpyObj('InstitutionsService', ['get', 'subscribe', 'save']);

    // Create mock institutions
    mockInstitutions = new Institutions();

    // Mock the service methods
    mockInstitutionsService.get.and.returnValue(mockInstitutions);
    mockInstitutionsService.subscribe.and.returnValue(new Subscription());

    await TestBed.configureTestingModule({
      imports: [InstitutionsModule],
      providers: [
        provideHttpClient(),
        { provide: InstitutionsService, useValue: mockInstitutionsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InstitutionsComponent);
    component = fixture.componentInstance;
  });

  describe('Basic Rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render the institutions page', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Institutions');
      expect(compiled.querySelector('p')?.textContent).toContain('configure your Banks and institutions');
    });

    it('should load the institutions service on init', () => {
      spyOn(component, 'ngOnInit').and.callThrough();
      component.ngOnInit();

      expect(mockInstitutionsService.get).toHaveBeenCalled();
      expect(mockInstitutionsService.subscribe).toHaveBeenCalled();
    });
  });

  describe('Form Visibility', () => {
    it('should show form when add button is clicked', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      // Initially form should be hidden
      expect(component.formVisible).toBeFalse();

      // Click add button
      const addButton = compiled.querySelector('.add-icon') as HTMLElement;
      addButton.click();

      expect(component.formVisible).toBeTrue();
    });

    it('should hide form when close button is clicked', () => {
      // Show form first
      component.formVisible = true;
      fixture.detectChanges();

      expect(component.formVisible).toBeTrue();

      // Call close method
      component.close();

      expect(component.formVisible).toBeFalse();
    });

    it('should hide form when cancel is called', () => {
      // Show form first
      component.formVisible = true;
      fixture.detectChanges();

      expect(component.formVisible).toBeTrue();

      // Call cancel method
      component.cancel();

      expect(component.formVisible).toBeFalse();
      expect(component.institution.name).toBe('');
      expect(component.institution.description).toBe('');
      expect(component.institution.mappings.length).toBe(0);
    });
  });

  describe('Institution Management with localStorage', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();

      // Create test institutions
      const testInstitution1 = new Institution();
      testInstitution1.id = 'inst-1';
      testInstitution1.name = 'Test Bank 1';
      testInstitution1.description = 'First test bank';
      testInstitution1.addMapping('Date', 'datePosted', MapTypes.dynamic);
      testInstitution1.addMapping('Amount', 'amount', MapTypes.dynamic);

      const testInstitution2 = new Institution();
      testInstitution2.id = 'inst-2';
      testInstitution2.name = 'Test Bank 2';
      testInstitution2.description = 'Second test bank';
      testInstitution2.addMapping('Transaction Date', 'datePosted', MapTypes.dynamic);
      testInstitution2.addMapping('Transaction Amount', 'amount', MapTypes.dynamic);

      mockInstitutions.add(testInstitution1, testInstitution2);

      // Mock localStorage data
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockInstitutions));
      spyOn(localStorage, 'setItem');
    });

    it('should render institutions with mappings from localStorage', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      // Check that both institutions are rendered
      const institutionCards = compiled.querySelectorAll('.data-card-container');
      expect(institutionCards.length).toBe(2);

      // Check first institution
      expect(compiled.textContent).toContain('Test Bank 1');
      expect(compiled.textContent).toContain('First test bank');

      // Check second institution
      expect(compiled.textContent).toContain('Test Bank 2');
      expect(compiled.textContent).toContain('Second test bank');

      // Check mappings are displayed
      expect(compiled.textContent).toContain('Date');
      expect(compiled.textContent).toContain('datePosted');
      expect(compiled.textContent).toContain('Amount');
      expect(compiled.textContent).toContain('amount');
    });

    it('should render multiple institutions if provided', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const institutionCards = compiled.querySelectorAll('.data-card-container');
      expect(institutionCards.length).toBe(2);

      // Verify both institutions are displayed
      const institutionNames = Array.from(compiled.querySelectorAll('h2')).map(h => h.textContent?.trim());
      expect(institutionNames).toContain('Test Bank 1');
      expect(institutionNames).toContain('Test Bank 2');
    });

    it('should render form populated with institution data when edit is clicked', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      // Click edit button for first institution
      const editButtons = compiled.querySelectorAll('.edit-icon');
      const firstEditButton = editButtons[0] as HTMLElement;
      firstEditButton.click();

      expect(component.formVisible).toBeTrue();
      expect(component.institution.id).toBe('inst-1');
      expect(component.institution.name).toBe('Test Bank 1');
      expect(component.institution.description).toBe('First test bank');
      expect(component.institution.mappings.length).toBe(2);
    });

    it('should remove institution and save to localStorage when delete is clicked', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      // Initially should have 2 institutions
      expect(component.institutions.length).toBe(2);

      // Click delete button for first institution
      const deleteButtons = compiled.querySelectorAll('.delete-icon');
      const firstDeleteButton = deleteButtons[0] as HTMLElement;
      firstDeleteButton.click();

      // Should have removed the institution
      expect(component.institutions.length).toBe(1);
      expect(component.institutions[0].id).toBe('inst-2');

      // Should have called save on the service
      expect(mockInstitutionsService.save).toHaveBeenCalledWith(component.institutions);
    });
  });

  describe('Form Operations', () => {
    it('should save new institution when save is called', () => {
      // Show form
      component.formVisible = true;
      fixture.detectChanges();

      // Create a new institution
      const newInstitution = new Institution();
      newInstitution.name = 'New Bank';
      newInstitution.description = 'A new test bank';
      newInstitution.addMapping('Date', 'datePosted', MapTypes.dynamic);

      // Call save
      component.save(newInstitution);

      // Should have added to institutions
      expect(component.institutions.length).toBe(1);
      expect(component.institutions[0].name).toBe('New Bank');

      // Should have called save on service
      expect(mockInstitutionsService.save).toHaveBeenCalledWith(component.institutions);

      // Form should be hidden
      expect(component.formVisible).toBeFalse();
    });

    it('should update existing institution when save is called', () => {
      // Add an institution first
      const existingInstitution = new Institution();
      existingInstitution.id = 'existing-id';
      existingInstitution.name = 'Existing Bank';
      existingInstitution.description = 'Existing description';
      component.institutions.add(existingInstitution);

      // Show form
      component.formVisible = true;
      fixture.detectChanges();

      // Update the institution
      const updatedInstitution = new Institution();
      updatedInstitution.id = 'existing-id';
      updatedInstitution.name = 'Updated Bank';
      updatedInstitution.description = 'Updated description';

      // Call save
      component.save(updatedInstitution);

      // Should have updated the existing institution
      expect(component.institutions[0].name).toBe('Updated Bank');
      expect(component.institutions[0].description).toBe('Updated description');

      // Should have called save on service
      expect(mockInstitutionsService.save).toHaveBeenCalledWith(component.institutions);
    });

    it('should reset form when reset is called', () => {
      // Set some data on the institution
      component.institution.name = 'Test Name';
      component.institution.description = 'Test Description';
      component.institution.addMapping('Test', 'merchant', MapTypes.dynamic);

      // Call reset
      component.reset();

      // Should have reset to new Institution
      expect(component.institution.name).toBe('');
      expect(component.institution.description).toBe('');
      expect(component.institution.mappings.length).toBe(0);
    });
  });

  describe('Additional Features', () => {
    it('should handle institution mappings correctly', () => {
      const institution = new Institution();
      institution.addMapping('CSV_Date', 'datePosted', MapTypes.dynamic);
      institution.addMapping('CSV_Amount', 'amount', MapTypes.dynamic);
      institution.addMapping('CSV_Description', 'description', MapTypes.dynamic);

      expect(institution.mappings.length).toBe(3);
      expect(institution.mappings[0].fromField).toBe('CSV_Date');
      expect(institution.mappings[0].toField).toBe('datePosted');
      expect(institution.mappings[0].mapType).toBe(MapTypes.dynamic);
    });

    it('should handle subscription cleanup', () => {
      // Test that the component can handle undefined subscriptions gracefully
      (component as any)['#institutionUpdates'] = undefined;

      // Should not throw an error
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle empty institutions list', () => {
      // Clear institutions
      component.institutions.clear();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const institutionCards = compiled.querySelectorAll('.data-card-container');

      // Should not render any institution cards
      expect(institutionCards.length).toBe(0);
    });
  });
});
