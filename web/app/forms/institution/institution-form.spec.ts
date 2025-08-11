import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { InstitutionFormComponent } from './institution-form';
import { Institution, MapTypes } from 'app/lib/institutions';

describe('InstitutionFormComponent', () => {
  let component: InstitutionFormComponent;
  let fixture: ComponentFixture<InstitutionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InstitutionFormComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InstitutionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with a new Institution', () => {
      expect(component.institution).toBeInstanceOf(Institution);
      expect(component.institution.name).toBe('');
      expect(component.institution.description).toBe('');
    });

    it('should initialize with empty errors array', () => {
      expect(component.errors).toEqual([]);
    });

    it('should initialize fields array', () => {
      expect(component.fields).toBeDefined();
      expect(Array.isArray(component.fields)).toBe(true);
    });

    it('should add initial mapping on init', () => {
      expect(component.institution.mappings.length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('should validate successfully with valid data', () => {
      component.institution.name = 'Test Bank';
      component.institution.description = 'Test Description';

      const isValid = component.validate();

      expect(isValid).toBe(true);
      expect(component.errors.length).toBe(0);
    });

    it('should fail validation when name is empty', () => {
      component.institution.name = '';
      component.institution.description = 'Test Description';

      const isValid = component.validate();

      expect(isValid).toBe(false);
      expect(component.errors).toContain('Name is required.');
    });

    it('should fail validation when name exceeds 255 characters', () => {
      component.institution.name = 'a'.repeat(256);
      component.institution.description = 'Test Description';

      const isValid = component.validate();

      expect(isValid).toBe(false);
      expect(component.errors).toContain('Name must be less than 255 characters.');
    });

    it('should fail validation when description exceeds 255 characters', () => {
      component.institution.name = 'Test Bank';
      component.institution.description = 'a'.repeat(256);

      const isValid = component.validate();

      expect(isValid).toBe(false);
      expect(component.errors).toContain('Description must be less than 255 characters.');
    });

    it('should fail validation when institution is null', () => {
      component.institution = null as any;

      const isValid = component.validate();

      expect(isValid).toBe(false);
      expect(component.errors).toContain('Institution is not set? This is a bug, please report it to the developers at support@markizano.net');
    });

    it('should clear previous errors before validating', () => {
      component.errors = ['Previous error'];
      component.institution.name = 'Valid Name';
      component.institution.description = 'Valid Description';

      component.validate();

      expect(component.errors).not.toContain('Previous error');
    });
  });

  describe('Keyboard Event Handling', () => {
    it('should call doCancelForm when Escape key is pressed', () => {
      spyOn(component, 'doCancelForm');

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.keyPressEvent(event);

      expect(component.doCancelForm).toHaveBeenCalled();
    });

    it('should call saveChanges when Ctrl+Enter is pressed', () => {
      spyOn(component, 'saveChanges');

      const event = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
      component.keyPressEvent(event);

      expect(component.saveChanges).toHaveBeenCalled();
    });

    it('should not trigger actions for other key combinations', () => {
      spyOn(component, 'doCancelForm');
      spyOn(component, 'saveChanges');

      const event = new KeyboardEvent('keydown', { key: 'Enter' }); // Enter without Ctrl
      component.keyPressEvent(event);

      expect(component.doCancelForm).not.toHaveBeenCalled();
      expect(component.saveChanges).not.toHaveBeenCalled();
    });
  });

  describe('Event Emission', () => {
    it('should emit saveForm event when form is saved successfully', () => {
      const saveFormSpy = spyOn(component.saveForm, 'emit');
      const institutionChangeSpy = spyOn(component.institutionChange, 'emit');
      component.institution.name = 'Test Bank';
      component.institution.description = 'Test Description';
      const institutionBeforeReset = { ...component.institution };

      component.saveChanges();

      // The component should have emitted the institution before reset
      expect(saveFormSpy).toHaveBeenCalled();
      expect(institutionChangeSpy).toHaveBeenCalled();

      // Check that the emitted institution had the correct data before reset
      const savedInstitution = saveFormSpy.calls.argsFor(0)[0];
      expect(savedInstitution).toBeDefined();
      expect(savedInstitution!.name).toBe('Test Bank');
      expect(savedInstitution!.description).toBe('Test Description');
    });

    it('should not emit saveForm event when validation fails', () => {
      spyOn(component.saveForm, 'emit');
      spyOn(component.institutionChange, 'emit');
      component.institution.name = ''; // Invalid

      component.saveChanges();

      expect(component.saveForm.emit).not.toHaveBeenCalled();
      expect(component.institutionChange.emit).not.toHaveBeenCalled();
    });

    it('should emit cancelForm event when form is canceled', () => {
      spyOn(component.cancelForm, 'emit');

      component.doCancelForm();

      expect(component.cancelForm.emit).toHaveBeenCalled();
    });

    it('should emit institutionChange when adding mapping', () => {
      spyOn(component.institutionChange, 'emit');
      const initialLength = component.institution.mappings.length;

      component.addMapping();

      expect(component.institutionChange.emit).toHaveBeenCalledWith(component.institution);
      expect(component.institution.mappings.length).toBe(initialLength + 1);
    });

    it('should emit institutionChange when removing mapping', () => {
      spyOn(component.institutionChange, 'emit');
      component.institution.addMapping('test', undefined, MapTypes.dynamic);
      const initialLength = component.institution.mappings.length;

      component.removeMapping(0);

      expect(component.institutionChange.emit).toHaveBeenCalledWith(component.institution);
      expect(component.institution.mappings.length).toBe(initialLength - 1);
    });
  });

  describe('Mapping Management', () => {
    beforeEach(() => {
      // Reset to clean state
      component.institution = new Institution();
      component.ngOnInit();
    });

    it('should add mapping when fields are available', () => {
      const initialLength = component.institution.mappings.length;

      component.addMapping();

      expect(component.institution.mappings.length).toBe(initialLength + 1);
    });

    it('should not add mapping when no fields available', () => {
      // Fill all available fields
      component.fields = [];
      const initialLength = component.institution.mappings.length;

      component.addMapping();

      expect(component.institution.mappings.length).toBe(initialLength);
    });

    it('should remove mapping at correct index', () => {
      component.institution.addMapping('test1', undefined, MapTypes.dynamic);
      component.institution.addMapping('test2', undefined, MapTypes.dynamic);
      const initialLength = component.institution.mappings.length;

      component.removeMapping(0);

      expect(component.institution.mappings.length).toBe(initialLength - 1);
    });

    it('should throw error when removing mapping with invalid index', () => {
      expect(() => {
        component.removeMapping(-1);
      }).toThrow();

      expect(() => {
        component.removeMapping(999);
      }).toThrow();
    });

    it('should update transaction fields after adding mapping', () => {
      const initialFields = component.fields.length;

      component.addMapping();

      // Fields should be updated to reflect available options
      expect(component.fields.length).toBeLessThanOrEqual(initialFields);
    });

    it('should update transaction fields after removing mapping', () => {
      component.institution.addMapping('test', 'amount' as any, MapTypes.dynamic);
      component.getTransactionFields();
      const fieldsAfterAdd = component.fields.length;

      component.removeMapping(component.institution.mappings.length - 1);

      expect(component.fields.length).toBeGreaterThanOrEqual(fieldsAfterAdd);
    });
  });

  describe('CSV Parsing', () => {
    beforeEach(() => {
      // Mock the Institutions.csvHandler method
      spyOn(require('app/lib/institutions').Institutions, 'csvHandler').and.returnValue(
        Promise.resolve(['Date', 'Description', 'Amount', 'Balance'])
      );
    });

    it('should parse CSV files and create mappings', () => {
      spyOn(component.institutionChange, 'emit');
      const mockFiles = [new File(['test'], 'test.csv')] as File[];

      component.parseCSVFiles(mockFiles);

      expect(component.institution.mappings.length).toBeGreaterThan(0);
      expect(component.institutionChange.emit).toHaveBeenCalledWith(component.institution);
    });

    it('should create mappings from CSV headers', () => {
      const mockFiles = [new File(['test'], 'test.csv')] as File[];

      component.parseCSVFiles(mockFiles);

      const mapping = component.institution.mappings[0];
      expect(mapping.fromField).toBe('Date');
      expect(mapping.mapType).toBe(MapTypes.dynamic);
    });
  });

  describe('Form Reset', () => {
    it('should reset form after successful save', () => {
      component.institution.name = 'Test Bank';
      component.institution.description = 'Test Description';
      component.errors = ['Some error'];

      component.saveChanges();

      expect(component.institution).toBeInstanceOf(Institution);
      expect(component.institution.name).toBe('');
      expect(component.institution.description).toBe('');
      expect(component.errors).toEqual([]);
    });

    it('should reset form when canceled', () => {
      component.institution.name = 'Test Bank';
      component.institution.description = 'Test Description';
      component.errors = ['Some error'];

      component.doCancelForm();

      expect(component.institution).toBeInstanceOf(Institution);
      expect(component.institution.name).toBe('');
      expect(component.institution.description).toBe('');
      expect(component.errors).toEqual([]);
    });

    it('should reset errors and institution in reset method', () => {
      component.institution.name = 'Test Bank';
      component.errors = ['Some error'];

      component.reset();

      expect(component.institution).toBeInstanceOf(Institution);
      expect(component.institution.name).toBe('');
      expect(component.errors).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty institution gracefully', () => {
      component.institution = new Institution();

      expect(() => component.getTransactionFields()).not.toThrow();
      expect(() => component.validate()).not.toThrow();
    });

    it('should handle getTransactionFields with no mappings', () => {
      component.institution = new Institution();
      // Clear mappings properly by creating new empty InstitutionMappings
      const InstitutionMappings = require('app/lib/institutions').InstitutionMappings;
      component.institution.mappings = InstitutionMappings.fromList([]);

      const fields = component.getTransactionFields();

      expect(fields.length).toBeGreaterThan(0); // Should have transaction fields
    });

    it('should prevent body drop by default', () => {
      expect(component.preventBodyDrop).toBe(true);
    });

    it('should log when no more fields are available for mapping', () => {
      spyOn(console, 'log');
      component.fields = [];

      component.addMapping();

      expect(console.log).toHaveBeenCalledWith('No more institution fields permitted.');
    });

    it('should log when removing mapping', () => {
      spyOn(console, 'log');
      component.institution.addMapping('test', undefined, MapTypes.dynamic);

      component.removeMapping(0);

      expect(console.log).toHaveBeenCalledWith(jasmine.stringContaining('Removed mapping'));
    });
  });
});
