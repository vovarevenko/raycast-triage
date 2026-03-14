import { describe, expect, it } from 'vitest'
import { EXAMPLE_TEXT, parseInput } from '../src/parse-input'

const NOW = new Date(1996, 6, 27, 8, 8, 0, 0) // 27.07.1996 08:08

const p = (input: string) => parseInput(input, NOW)

describe('parseInput', () => {
  describe('basic text', () => {
    it('passes through plain text', () => {
      const r = p(EXAMPLE_TEXT)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(0)
      expect(r.dueDate).toBeNull()
      expect(r.hasTime).toBe(false)
    })

    it('trims whitespace', () => {
      expect(p(`  ${EXAMPLE_TEXT}  `).title).toBe(EXAMPLE_TEXT)
    })

    it('collapses multiple spaces', () => {
      expect(p(EXAMPLE_TEXT.replace(/ /g, '   ')).title).toBe(EXAMPLE_TEXT)
    })
  })

  describe('priority', () => {
    it('! → low (9)', () => {
      const r = p(`${EXAMPLE_TEXT} !`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(9)
    })

    it('!! → medium (5)', () => {
      const r = p(`${EXAMPLE_TEXT} !!`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(5)
    })

    it('!!! → high (1)', () => {
      const r = p(`${EXAMPLE_TEXT} !!!`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(1)
    })

    it('at start', () => {
      const r = p(`!!! ${EXAMPLE_TEXT}`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(1)
    })

    it('in middle', () => {
      const words = EXAMPLE_TEXT.split(' ')
      const r = p(`${words[0]} !!! ${words.slice(1).join(' ')}`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.priority).toBe(1)
    })

    it('attached to word at end: "Foo!"', () => {
      const r = p('Foo!')
      expect(r.title).toBe('Foo')
      expect(r.priority).toBe(9)
    })

    it('attached to word at end: "Foo!!!"', () => {
      const r = p('Foo!!!')
      expect(r.title).toBe('Foo')
      expect(r.priority).toBe(1)
    })

    it('ignores ! in middle of word', () => {
      expect(p('check example.com/page!important').priority).toBe(0)
    })
  })

  describe('relative date — sub-day (has time)', () => {
    it('/r 30s → 08:08:30', () => {
      const r = p(`${EXAMPLE_TEXT} /r 30s`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.hasTime).toBe(true)
      expect(r.dueDate!.getSeconds()).toBe(30)
    })

    it('/r 20m → 08:28', () => {
      const r = p(`${EXAMPLE_TEXT} /r 20m`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.hasTime).toBe(true)
      expect(r.dueDate!.getHours()).toBe(8)
      expect(r.dueDate!.getMinutes()).toBe(28)
    })

    it('/r 1h → 09:08', () => {
      const r = p(`${EXAMPLE_TEXT} /r 1h`)
      expect(r.hasTime).toBe(true)
      expect(r.dueDate!.getHours()).toBe(9)
      expect(r.dueDate!.getMinutes()).toBe(8)
    })
  })

  describe('relative date — day+ (no time)', () => {
    it('/r 1d → 28.07', () => {
      const r = p(`${EXAMPLE_TEXT} /r 1d`)
      expect(r.hasTime).toBe(false)
      expect(r.dueDate!.getDate()).toBe(28)
      expect(r.dueDate!.getHours()).toBe(0)
    })

    it('/r 1w → 03.08', () => {
      const r = p(`${EXAMPLE_TEXT} /r 1w`)
      expect(r.hasTime).toBe(false)
      expect(r.dueDate!.getDate()).toBe(3)
      expect(r.dueDate!.getMonth()).toBe(7) // August
    })
  })

  describe('relative date — day+ with explicit time', () => {
    it('/r 2d 21:25 → 29.07 21:25', () => {
      const r = p(`/r 2d 21:25, ${EXAMPLE_TEXT}`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.hasTime).toBe(true)
      expect(r.dueDate!.getDate()).toBe(29)
      expect(r.dueDate!.getHours()).toBe(21)
      expect(r.dueDate!.getMinutes()).toBe(25)
    })
  })

  describe('relative date — mid-string comma', () => {
    it('/r 1d, at mid-string', () => {
      const r = p('Foo /r 1d, bar')
      expect(r.title).toBe('Foo bar')
      expect(r.hasTime).toBe(false)
      expect(r.dueDate!.getDate()).toBe(28)
    })

    it('/r 2h, at start', () => {
      const r = p(`/r 2h, ${EXAMPLE_TEXT}`)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.hasTime).toBe(true)
      expect(r.dueDate!.getHours()).toBe(10)
      expect(r.dueDate!.getMinutes()).toBe(8)
    })
  })

  describe('absolute date', () => {
    it('/r DD.MM → current year', () => {
      const r = p(`${EXAMPLE_TEXT} /r 20.09`)
      expect(r.hasTime).toBe(false)
      expect(r.dueDate!.getDate()).toBe(20)
      expect(r.dueDate!.getMonth()).toBe(8)
      expect(r.dueDate!.getFullYear()).toBe(1996)
    })

    it('/r DD.MM.YY → 2-digit year', () => {
      const r = p(`${EXAMPLE_TEXT} /r 20.09.26`)
      expect(r.hasTime).toBe(false)
      expect(r.dueDate!.getDate()).toBe(20)
      expect(r.dueDate!.getMonth()).toBe(8)
      expect(r.dueDate!.getFullYear()).toBe(2026)
    })

    it('/r DD.MM.YYYY → 4-digit year', () => {
      const r = p(`${EXAMPLE_TEXT} /r 20.09.2026`)
      expect(r.dueDate!.getFullYear()).toBe(2026)
    })
  })

  describe('absolute date — with time', () => {
    it('/r DD.MM HH:MM', () => {
      const r = p(`/r 20.09 14:00, ${EXAMPLE_TEXT}`)
      expect(r.hasTime).toBe(true)
      expect(r.dueDate!.getDate()).toBe(20)
      expect(r.dueDate!.getMonth()).toBe(8)
      expect(r.dueDate!.getHours()).toBe(14)
    })

    it('/r DD.MM.YY HH:MM', () => {
      const r = p(`${EXAMPLE_TEXT} /r 1.12.26 9:30`)
      expect(r.hasTime).toBe(true)
      expect(r.dueDate!.getDate()).toBe(1)
      expect(r.dueDate!.getMonth()).toBe(11)
      expect(r.dueDate!.getFullYear()).toBe(2026)
      expect(r.dueDate!.getHours()).toBe(9)
      expect(r.dueDate!.getMinutes()).toBe(30)
    })
  })

  describe('invalid /r', () => {
    it('stays in title when value is invalid', () => {
      const r = p(`${EXAMPLE_TEXT} /r xyz`)
      expect(r.title).toBe(`${EXAMPLE_TEXT} /r xyz`)
      expect(r.dueDate).toBeNull()
    })
  })

  describe('trailing whitespace with /r', () => {
    it('trims and still parses', () => {
      const r = p(`${EXAMPLE_TEXT} /r 1d  `)
      expect(r.title).toBe(EXAMPLE_TEXT)
      expect(r.dueDate).not.toBeNull()
    })
  })

  describe('inline tags', () => {
    it('keeps single tag', () => {
      expect(p('review PR #work').title).toBe('review PR #work')
    })

    it('keeps multiple tags', () => {
      expect(p('task #foo #bar').title).toBe('task #foo #bar')
    })
  })

  describe('URL cleanup', () => {
    it('strips https://', () => {
      expect(p('check https://example.com/foo').title).toBe(
        'check example.com/foo',
      )
    })

    it('strips http://', () => {
      expect(p('check http://example.com/foo').title).toBe(
        'check example.com/foo',
      )
    })

    it('strips protocol and trailing slash', () => {
      expect(p('check https://example.com/foo/').title).toBe(
        'check example.com/foo',
      )
    })

    it('preserves internal path slashes', () => {
      expect(p('check https://example.com/a/b/c').title).toBe(
        'check example.com/a/b/c',
      )
    })
  })

  describe('combined', () => {
    it('priority + date + tag', () => {
      const r = p(`!!! /r 1d, ${EXAMPLE_TEXT} #work`)
      expect(r.priority).toBe(1)
      expect(r.hasTime).toBe(false)
      expect(r.dueDate!.getDate()).toBe(28)
      expect(r.title).toBe(`${EXAMPLE_TEXT} #work`)
    })

    it('all features', () => {
      const r = p(
        'review https://github.com/org/repo/pull/123/ !! #review /r 2h',
      )
      expect(r.title).toBe('review github.com/org/repo/pull/123 #review')
      expect(r.priority).toBe(5)
      expect(r.hasTime).toBe(true)
      expect(r.dueDate!.getHours()).toBe(10)
      expect(r.dueDate!.getMinutes()).toBe(8)
    })

    it('empty title after parsing', () => {
      const r = p('!!!')
      expect(r.title).toBe('')
      expect(r.priority).toBe(1)
    })
  })
})
