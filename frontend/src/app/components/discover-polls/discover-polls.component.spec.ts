import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverPollsComponent } from './discover-polls.component';

describe('DiscoverPollsComponent', () => {
  let component: DiscoverPollsComponent;
  let fixture: ComponentFixture<DiscoverPollsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverPollsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscoverPollsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
