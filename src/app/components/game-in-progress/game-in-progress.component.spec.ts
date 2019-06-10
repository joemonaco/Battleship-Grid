import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInProgressComponent } from './game-in-progress.component';

describe('GameInProgressComponent', () => {
  let component: GameInProgressComponent;
  let fixture: ComponentFixture<GameInProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameInProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameInProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
