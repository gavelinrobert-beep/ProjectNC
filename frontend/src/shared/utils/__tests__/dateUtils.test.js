import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeDate,
  formatRelativeTime,
  formatChartDate,
  parseDate,
  isToday,
  isYesterday,
  isPast,
  getDateRange
} from '../dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date in Swedish format (YYYY-MM-DD)', () => {
      const date = new Date('2025-01-15T14:30:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return "-" for null or undefined', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
      expect(formatDate('')).toBe('-')
    })

    it('should return "-" for invalid date', () => {
      expect(formatDate('invalid')).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time in Swedish format', () => {
      const date = new Date('2025-01-15T14:30:00Z')
      const result = formatDateTime(date)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    })

    it('should return "-" for null or undefined', () => {
      expect(formatDateTime(null)).toBe('-')
      expect(formatDateTime(undefined)).toBe('-')
    })
  })

  describe('formatTime', () => {
    it('should format time only (HH:MM)', () => {
      const date = new Date('2025-01-15T14:30:00Z')
      const result = formatTime(date)
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should return "-" for null', () => {
      expect(formatTime(null)).toBe('-')
    })
  })

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "Just now" for dates less than 60 seconds ago', () => {
      const date = new Date('2025-01-15T11:59:30Z')
      expect(formatRelativeDate(date)).toBe('Just now')
    })

    it('should return minutes for dates less than 60 minutes ago', () => {
      const date = new Date('2025-01-15T11:30:00Z')
      expect(formatRelativeDate(date)).toBe('30 minutes ago')
    })

    it('should return singular "minute" for 1 minute ago', () => {
      const date = new Date('2025-01-15T11:59:00Z')
      expect(formatRelativeDate(date)).toBe('1 minute ago')
    })

    it('should return hours for dates less than 24 hours ago', () => {
      const date = new Date('2025-01-15T09:00:00Z')
      expect(formatRelativeDate(date)).toBe('3 hours ago')
    })

    it('should return days for dates less than 7 days ago', () => {
      const date = new Date('2025-01-13T12:00:00Z')
      expect(formatRelativeDate(date)).toBe('2 days ago')
    })

    it('should return weeks for dates less than 30 days ago', () => {
      const date = new Date('2025-01-01T12:00:00Z')
      expect(formatRelativeDate(date)).toBe('2 weeks ago')
    })

    it('should return months for dates less than 365 days ago', () => {
      const date = new Date('2024-11-15T12:00:00Z')
      expect(formatRelativeDate(date)).toBe('2 months ago')
    })

    it('should return years for dates more than 365 days ago', () => {
      const date = new Date('2023-01-15T12:00:00Z')
      expect(formatRelativeDate(date)).toBe('2 years ago')
    })

    it('should return "-" for null', () => {
      expect(formatRelativeDate(null)).toBe('-')
    })
  })

  describe('formatRelativeTime', () => {
    it('should be an alias for formatRelativeDate', () => {
      const date = new Date()
      expect(formatRelativeTime(date)).toBe(formatRelativeDate(date))
    })
  })

  describe('formatChartDate', () => {
    it('should format date for charts (short month)', () => {
      const date = new Date('2025-01-15T14:30:00Z')
      const result = formatChartDate(date)
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/)
    })

    it('should return empty string for null', () => {
      expect(formatChartDate(null)).toBe('')
      expect(formatChartDate(undefined)).toBe('')
    })

    it('should return empty string for invalid date', () => {
      expect(formatChartDate('invalid')).toBe('')
    })
  })

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const result = parseDate('2025-01-15')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2025)
    })

    it('should return null for invalid date', () => {
      expect(parseDate('invalid')).toBeNull()
    })

    it('should return null for null or undefined', () => {
      expect(parseDate(null)).toBeNull()
      expect(parseDate(undefined)).toBeNull()
    })
  })

  describe('isToday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for today\'s date', () => {
      const today = new Date('2025-01-15T08:00:00Z')
      expect(isToday(today)).toBe(true)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date('2025-01-14T12:00:00Z')
      expect(isToday(yesterday)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isToday(null)).toBe(false)
    })
  })

  describe('isYesterday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for yesterday\'s date', () => {
      const yesterday = new Date('2025-01-14T12:00:00Z')
      expect(isYesterday(yesterday)).toBe(true)
    })

    it('should return false for today', () => {
      const today = new Date('2025-01-15T12:00:00Z')
      expect(isYesterday(today)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isYesterday(null)).toBe(false)
    })
  })

  describe('isPast', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for past date', () => {
      const past = new Date('2025-01-14T12:00:00Z')
      expect(isPast(past)).toBe(true)
    })

    it('should return false for future date', () => {
      const future = new Date('2025-01-16T12:00:00Z')
      expect(isPast(future)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isPast(null)).toBe(false)
    })
  })

  describe('getDateRange', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return today range', () => {
      const { start, end } = getDateRange('today')
      expect(start.getDate()).toBe(15)
      expect(start.getHours()).toBe(0)
      expect(end.getDate()).toBe(15)
    })

    it('should return yesterday range', () => {
      const { start, end } = getDateRange('yesterday')
      expect(start.getDate()).toBe(14)
      expect(start.getHours()).toBe(0)
      expect(end.getDate()).toBe(14)
      expect(end.getHours()).toBe(23)
    })

    it('should return last 7 days range', () => {
      const { start, end } = getDateRange('last7days')
      expect(start.getDate()).toBe(8)
      expect(end.getDate()).toBe(15)
    })

    it('should return last 30 days range', () => {
      const { start, end } = getDateRange('last30days')
      expect(start.getDate()).toBe(16)
      expect(start.getMonth()).toBe(11) // December (0-indexed)
      expect(end.getDate()).toBe(15)
      expect(end.getMonth()).toBe(0) // January
    })

    it('should return this month range', () => {
      const { start, end } = getDateRange('thisMonth')
      expect(start.getDate()).toBe(1)
      expect(start.getMonth()).toBe(0) // January
      expect(end.getDate()).toBe(15)
    })

    it('should return last month range', () => {
      const { start, end } = getDateRange('lastMonth')
      expect(start.getMonth()).toBe(11) // December (0-indexed)
      expect(start.getDate()).toBe(1)
      expect(end.getMonth()).toBe(11) // December
      expect(end.getDate()).toBe(31)
    })

    it('should default to last 7 days for unknown range', () => {
      const { start, end } = getDateRange('unknown')
      expect(start.getDate()).toBe(8)
      expect(end.getDate()).toBe(15)
    })
  })
})
