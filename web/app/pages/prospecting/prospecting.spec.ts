import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { ProspectingComponent } from './prospecting';
import { ProspectingModule } from './prospecting.module';
import { AccountsService } from 'app/services/accounts.service';
import { Transactions } from 'app/lib/transactions';

describe('ProspectingComponent', () => {
  let component: ProspectingComponent;
  let fixture: ComponentFixture<ProspectingComponent>;
  let mockAccountsService: jasmine.SpyObj<AccountsService>;

  beforeEach(async () => {
    // Create mock accounts service
    mockAccountsService = jasmine.createSpyObj('AccountsService', ['get', 'subscribe']);

    // Create mock accounts with getTransactions method
    const mockAccounts = jasmine.createSpyObj('Accounts', ['getTransactions']);
    const mockTransactions = new Transactions();

    // Mock the getTransactions method to return the mock transactions
    mockAccounts.getTransactions.and.returnValue(mockTransactions);

    // Mock the service methods
    mockAccountsService.get.and.returnValue(mockAccounts);
    mockAccountsService.subscribe.and.returnValue(new Subscription());

    await TestBed.configureTestingModule({
      imports: [ProspectingModule],
      providers: [
        provideHttpClient(),
        { provide: AccountsService, useValue: mockAccountsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProspectingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
