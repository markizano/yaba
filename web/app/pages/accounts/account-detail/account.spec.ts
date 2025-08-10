import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AccountDetailComponent } from './account';
import { AccountsModule } from 'app/pages/accounts/accounts.module';
import { AccountsService } from 'app/services/accounts.service';
import { Accounts } from 'app/lib/accounts';
import { Account } from 'app/lib/accounts';

describe('AccountComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;
  let mockAccountsService: jasmine.SpyObj<AccountsService>;
  let mockRoute: any;

  beforeEach(() => {
    // Create mock accounts service
    mockAccountsService = jasmine.createSpyObj('AccountsService', ['get', 'subscribe', 'save']);

    // Create mock accounts with a test account
    const mockAccounts = new Accounts();
    const testAccount = new Account();
    testAccount.id = 'test-account-id';
    testAccount.name = 'Test Account';
    mockAccounts.add(testAccount);

    mockAccountsService.get.and.returnValue(mockAccounts);

    // Create mock subscription
    const mockSubscription = new Subscription();
    mockAccountsService.subscribe.and.returnValue(mockSubscription);

    // Create mock route with account ID parameter
    mockRoute = {
      snapshot: {
        paramMap: {
          get: (param: string) => param === 'id' ? 'test-account-id' : null
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    });
    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
