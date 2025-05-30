import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CountdownComponent } from './countdown.component'
import { CountdownTime } from '../models/countdown-time.model'

describe('CountdownComponent', () => {
  let component: CountdownComponent
  let fixture: ComponentFixture<CountdownComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountdownComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(CountdownComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create component', () => {
    expect(component).toBeTruthy()
  })

  it('should sanitize title input', () => {
    component.inputEventTitle = 'New Year@2025!'
    component.checkTitleInput()
    expect(component.inputEventTitle).toBe('New Year2025')
  })

  it('should update countdown successfully (future date)', () => {
    component.inputEventDate = '2026-12-31'
    component.inputEventTime = '23:59'
    component.updateCountdown()

    expect(component.currentEventDate).toBe('2026-12-31')
    expect(component.currentEventTime).toBe('23:59')
    expect(component.alert.show).toBeTrue()
    expect(component.alert.message).toContain('updated!')
  })

  it('should handle immediate expiration for past dates', () => {
    component.inputEventDate = '2021-01-01'
    component.updateCountdown()

    component.countdown$.subscribe((time: CountdownTime) => {
      expect(time).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    })
    expect(component.alert.show).toBeTrue()
    expect(component.alert.message).toBe('Please select a future date and time')
  })

  it('should persist valid data to localStorage on reload', () => {
    component.inputEventTitle = 'Test'
    component.inputEventDate = '2030-12-31'
    component.inputEventTime = '20:10'
    component.updateCountdown()
    expect(JSON.parse(localStorage.getItem('countdownData')!)).toEqual({
      title: 'Test',
      date: '2030-12-31',
      time: '20:10',
    })
  })

  it('should unsubscribe on destroy', () => {
    const destroySpy = spyOn(component.destroy$, 'next')
    component.ngOnDestroy()
    expect(destroySpy).toHaveBeenCalled()
  })
})
