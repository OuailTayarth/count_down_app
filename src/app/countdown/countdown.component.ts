import { Component, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { interval, Subject, Observable, of } from 'rxjs'
import { takeUntil, map, startWith } from 'rxjs/operators'
import { CountdownTime } from '../models/countdown-time.model'
import { Alert } from '../models/alert.model'

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css'],
})
export class CountdownComponent implements OnDestroy {
  // I changed destroy$ private to public for testing
  public readonly destroy$ = new Subject<void>()
  private alertTimeout: any

  // User inputs from the form
  inputEventTitle: string = ''
  inputEventDate: string = ''
  inputEventTime: string = ''
  errorMessage: string = ''

  // Currently active countdown values shown in display
  currentEventTitle: string = 'Midsummer Eve' // Default Title
  currentEventDate: string = '2025-06-21' // Default date
  currentEventTime: string = '00:00' // Default time

  // Tracks alert visibility and message
  alert: Alert = {
    show: false,
    message: '',
  }

  private readonly MILLISECONDS_IN_SECOND = 1000

  countdown$: Observable<CountdownTime> = interval(1000).pipe(
    startWith(0),
    map(() =>
      this.calculateTimeDiff(this.currentEventDate, this.currentEventTime),
    ),
    takeUntil(this.destroy$),
  )

  // unsubscribes observables and cleans up Subject onDestroy
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  ngOnInit(): void {
    this.loadSavedCountdown()
  }

  /**
   * Verify event title input to only allows letters, numbers
   */
  checkTitleInput(): void {
    this.inputEventTitle = this.inputEventTitle.replace(/[^\w\s]/g, '')
  }

  /**
   * Updates countdown to new dat/time
   */
  updateCountdown(): void {
    // Check if title is empty or only spaces before updating the countdown
    if (!this.inputEventTitle.trim()) {
      this.showAlert('Please add a title before updating the countdown!')
      return
    }
    // If selected date time is in past, reset to zeros
    const now = new Date()
    const targetDateTime = new Date(
      `${this.inputEventDate}T${this.inputEventTime}:00`,
    )

    if (!this.inputEventDate || targetDateTime <= now) {
      this.showAlert('Please select a future date and time')
      this.countdown$ = of({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      return
    }

    this.currentEventTitle = this.inputEventTitle
    this.currentEventDate = this.inputEventDate
    this.currentEventTime = this.inputEventTime

    // persist to local storage
    localStorage.setItem(
      'countdownData',
      JSON.stringify({
        title: this.currentEventTitle,
        date: this.currentEventDate,
        time: this.currentEventTime,
      }),
    )

    this.showAlert(`Countdown to "${this.currentEventTitle}" updated!`)
  }

  /**
   * Loads and applies saved countdown data from localStorage to both current event and input fields.
   */
  private loadSavedCountdown(): void {
    const savedData = localStorage.getItem('countdownData')
    if (savedData) {
      try {
        const { title, date, time } = JSON.parse(savedData)

        // Update both current event and input fields
        this.currentEventTitle = title
        this.currentEventDate = date
        this.currentEventTime = time

        this.inputEventTitle = title
        this.inputEventDate = date
        this.inputEventTime = time
      } catch (e) {
        console.error('Failed to parse stored data', e)
        localStorage.removeItem('countdownData')
      }
    }
  }

  /**
   * Calculates remaining time for countdown
   * @param date - Target date
   * @param time - Target time
   */
  private calculateTimeDiff(date: string, time: string): CountdownTime {
    const targetDateTime = new Date(`${date}T${time}:00`)

    const now = new Date().getTime()
    const targetTime = targetDateTime.getTime()
    const diff = targetTime - now

    // Return 0 values if countdown expired
    if (diff <= 0) {
      this.showAlert(`The countdown for "${this.currentEventTitle}" has ended!`)
      this.countdown$ = of({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    }

    const seconds = Math.floor(diff / this.MILLISECONDS_IN_SECOND) % 60
    const minutes = Math.floor(diff / (this.MILLISECONDS_IN_SECOND * 60)) % 60
    const hours =
      Math.floor(diff / (this.MILLISECONDS_IN_SECOND * 60 * 60)) % 24
    const days = Math.floor(diff / (this.MILLISECONDS_IN_SECOND * 60 * 60 * 24))

    return { days, hours, minutes, seconds }
  }

  /**
   * Displays temporary alert message
   * @param message - Text to show in alert
   */
  showAlert(message: string): void {
    // Clear previous timeout if exists
    if (this.alertTimeout) clearTimeout(this.alertTimeout)

    this.alert.message = message
    this.alert.show = true

    // auto hide after 5 seconds
    this.alertTimeout = setTimeout(() => {
      this.alert.show = false
    }, 5000)
  }
}
