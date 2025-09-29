import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViajesAdministracionComponent } from './viajes-administracion.component';

describe('ViajesAdministracionComponent', () => {
  let component: ViajesAdministracionComponent;
  let fixture: ComponentFixture<ViajesAdministracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViajesAdministracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViajesAdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
