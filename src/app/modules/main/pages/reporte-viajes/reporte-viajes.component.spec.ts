import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteViajesComponent } from './reporte-viajes.component';

describe('ReporteViajesComponent', () => {
  let component: ReporteViajesComponent;
  let fixture: ComponentFixture<ReporteViajesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteViajesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteViajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
