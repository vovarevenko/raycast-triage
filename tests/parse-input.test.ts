import { describe, expect, it } from 'vitest'
import { EXAMPLE_TEXT, parseDueDate, parseInput } from '../src/parse-input'

const NOW = new Date(1996, 6, 27, 8, 8, 0, 0) // 27.07.1996 08:08

describe('parseInput', () => {
  describe('basic text', () => {
    it('passes through plain text', () => {
      const r = parseInput(EXAMPLE_TEXT)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(0)
    })

    it('trims whitespace', () => {
      expect(parseInput(`  ${EXAMPLE_TEXT}  `).title).toBe(EXAMPLE_TEXT)
    })

    it('collapses multiple spaces', () => {
      expect(parseInput(EXAMPLE_TEXT.replace(/ /g, '   ')).title).toBe(
        EXAMPLE_TEXT,
      )
    })
  })

  describe('priority', () => {
    it('! → low (9)', () => {
      const r = parseInput(`${EXAMPLE_TEXT} !`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(9)
    })

    it('!! → medium (5)', () => {
      const r = parseInput(`${EXAMPLE_TEXT} !!`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(5)
    })

    it('!!! → high (1)', () => {
      const r = parseInput(`${EXAMPLE_TEXT} !!!`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(1)
    })

    it('at start', () => {
      const r = parseInput(`!!! ${EXAMPLE_TEXT}`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(1)
    })

    it('in middle', () => {
      const words = EXAMPLE_TEXT.split(' ')
      const r = parseInput(`${words[0]} !!! ${words.slice(1).join(' ')}`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(1)
    })

    it('attached to word at end: "Foo!"', () => {
      const r = parseInput('Foo!')
      expect(r.title).toBe('Foo')
      expect(r.priority).toBe(9)
    })

    it('attached to word at end: "Foo!!!"', () => {
      const r = parseInput('Foo!!!')
      expect(r.title).toBe('Foo')
      expect(r.priority).toBe(1)
    })

    it('ignores ! in middle of word', () => {
      expect(parseInput('check example.com/page!important').priority).toBe(0)
    })
  })

  describe('inline tags', () => {
    it('keeps single tag', () => {
      expect(parseInput('review PR #work').title).toBe('review PR #work')
    })

    it('keeps multiple tags', () => {
      expect(parseInput('task #foo #bar').title).toBe('task #foo #bar')
    })
  })

  describe('URL cleanup', () => {
    it('strips https://', () => {
      expect(parseInput('check https://example.com/foo').title).toBe(
        'check example.com/foo',
      )
    })

    it('strips http://', () => {
      expect(parseInput('check http://example.com/foo').title).toBe(
        'check example.com/foo',
      )
    })

    it('strips protocol and trailing slash', () => {
      expect(parseInput('check https://example.com/foo/').title).toBe(
        'check example.com/foo',
      )
    })

    it('preserves internal path slashes', () => {
      expect(parseInput('check https://example.com/a/b/c').title).toBe(
        'check example.com/a/b/c',
      )
    })
  })

  describe('combined', () => {
    it('priority + tag', () => {
      const r = parseInput(`!!! ${EXAMPLE_TEXT} #work`)
      expect(r.priority).toBe(1)
      expect(r.title).toBe(`${EXAMPLE_TEXT} #work`)
    })

    it('all features', () => {
      const r = parseInput(
        'review https://github.com/org/repo/pull/123/ !! #review',
      )
      expect(r.title).toBe('review github.com/org/repo/pull/123 #review')
      expect(r.priority).toBe(5)
    })

    it('empty title after parsing', () => {
      const r = parseInput('!!!')
      expect(r.title).toBe('')
      expect(r.priority).toBe(1)
    })
  })
})

describe('parseDueDate', () => {
  const d = (input: string) => parseDueDate(input, NOW)

  describe('relative — sub-day (has time)', () => {
    it('30s → 08:08:30', () => {
      const r = d('30s')!
      expect(r.hasTime).toBe(true)
      expect(r.dueDate.getSeconds()).toBe(30)
    })

    it('20m → 08:28', () => {
      const r = d('20m')!
      expect(r.hasTime).toBe(true)
      expect(r.dueDate.getHours()).toBe(8)
      expect(r.dueDate.getMinutes()).toBe(28)
    })

    it('1h → 09:08', () => {
      const r = d('1h')!
      expect(r.hasTime).toBe(true)
      expect(r.dueDate.getHours()).toBe(9)
      expect(r.dueDate.getMinutes()).toBe(8)
    })
  })

  describe('relative — day+ (no time)', () => {
    it('1d → 28.07', () => {
      const r = d('1d')!
      expect(r.hasTime).toBe(false)
      expect(r.dueDate.getDate()).toBe(28)
      expect(r.dueDate.getHours()).toBe(0)
    })

    it('1w → 03.08', () => {
      const r = d('1w')!
      expect(r.hasTime).toBe(false)
      expect(r.dueDate.getDate()).toBe(3)
      expect(r.dueDate.getMonth()).toBe(7)
    })
  })

  describe('relative — day+ with explicit time', () => {
    it('2d 21:25 → 29.07 21:25', () => {
      const r = d('2d 21:25')!
      expect(r.hasTime).toBe(true)
      expect(r.dueDate.getDate()).toBe(29)
      expect(r.dueDate.getHours()).toBe(21)
      expect(r.dueDate.getMinutes()).toBe(25)
    })
  })

  describe('absolute date', () => {
    it('DD.MM → current year', () => {
      const r = d('20.09')!
      expect(r.hasTime).toBe(false)
      expect(r.dueDate.getDate()).toBe(20)
      expect(r.dueDate.getMonth()).toBe(8)
      expect(r.dueDate.getFullYear()).toBe(1996)
    })

    it('DD.MM.YY → 2-digit year', () => {
      const r = d('20.09.26')!
      expect(r.hasTime).toBe(false)
      expect(r.dueDate.getFullYear()).toBe(2026)
    })

    it('DD.MM.YYYY → 4-digit year', () => {
      const r = d('20.09.2026')!
      expect(r.dueDate.getFullYear()).toBe(2026)
    })
  })

  describe('absolute date — with time', () => {
    it('DD.MM HH:MM', () => {
      const r = d('20.09 14:00')!
      expect(r.hasTime).toBe(true)
      expect(r.dueDate.getDate()).toBe(20)
      expect(r.dueDate.getMonth()).toBe(8)
      expect(r.dueDate.getHours()).toBe(14)
    })

    it('DD.MM.YY HH:MM', () => {
      const r = d('1.12.26 9:30')!
      expect(r.hasTime).toBe(true)
      expect(r.dueDate.getDate()).toBe(1)
      expect(r.dueDate.getMonth()).toBe(11)
      expect(r.dueDate.getFullYear()).toBe(2026)
      expect(r.dueDate.getHours()).toBe(9)
      expect(r.dueDate.getMinutes()).toBe(30)
    })
  })

  describe('invalid input', () => {
    it('returns null for invalid value', () => {
      expect(d('xyz')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(d('')).toBeNull()
    })

    it('handles whitespace-only', () => {
      expect(d('   ')).toBeNull()
    })
  })
})
