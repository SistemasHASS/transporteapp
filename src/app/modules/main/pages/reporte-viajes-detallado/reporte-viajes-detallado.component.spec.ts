import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteViajesDetalladoComponent } from './reporte-viajes-detallado.component';

describe('ReporteViajesDetalladoComponent', () => {
  let component: ReporteViajesDetalladoComponent;
  let fixture: ComponentFixture<ReporteViajesDetalladoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteViajesDetalladoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteViajesDetalladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
