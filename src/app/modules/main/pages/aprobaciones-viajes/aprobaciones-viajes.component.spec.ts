import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionesViajesComponent } from './aprobaciones-viajes.component';

describe('AprobacionesViajesComponent', () => {
  let component: AprobacionesViajesComponent;
  let fixture: ComponentFixture<AprobacionesViajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprobacionesViajesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprobacionesViajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
