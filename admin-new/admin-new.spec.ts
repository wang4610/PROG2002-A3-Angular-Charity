import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminNew } from './admin-new';

describe('AdminNew', () => {
  let component: AdminNew;
  let fixture: ComponentFixture<AdminNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNew],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
