/**
 * @todo Use for random placeholder rotation
 * when Raycast adds dynamic placeholders for command arguments
 */
export const EXAMPLE_TEXTS = [
  'Fix the printer',
  'Migrate to microservices',
  'Rewrite in Rust',
  'Blame the intern',
  'Close 100 browser tabs',
  'Undo git push --force',
  'Unsubscribe from AI news',
  'Ship it, YOLO',
  'Touch grass immediately',
  'Pretend I saw the email',
  'Survive another sprint',
  'Add AI to the landing',
  'Overthink the architecture',
  'Open 12 new tabs about tabs',
  'Doom scroll less',
  "Ratio the CEO's tweet",
  'Check if Bitcoin crashed',
  'Explain NFTs to my mom',
  'Replace myself with GPT',
  'Name the variable properly',
  'Fight the imposter syndrome',
  'Decline the meeting politely',
  "Estimate 2 weeks (it's 2 months)",
  'Switch to Vim (this time for real)',
  'Stop aliasing everything',
  'Reject the recruiter nicely',
  'Benchmark my procrastination',
  'Read my own README',
  'Finish the side project',
  'Organize 9999 screenshots',
  "Tell PM it's not a bug",
  'Water the office plant',
]

export const EXAMPLE_TEXT = EXAMPLE_TEXTS[0]

export interface ParsedInput {
  title: string
  priority: number
}

export interface ParsedDueDate {
  dueDate: Date
  hasTime: boolean
}

const PRIORITY_MAP: Record<string, number> = {
  '!!!': 1,
  '!!': 5,
  '!': 9,
}

const DURATION_UNITS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
}

const SUB_DAY_UNITS = new Set(['s', 'm', 'h'])

function parseDuration(value: string) {
  const match = value.match(/^(\d+)([smhdw])$/)
  if (!match) return null
  const amount = parseInt(match[1], 10)
  const unit = match[2]
  const multiplier = DURATION_UNITS[unit]
  if (!multiplier) return null
  return { ms: amount * multiplier, unit }
}

function extractPriority(text: string) {
  const match = text.match(/(^|.*?)(?<!=)(!!!|!!|!)(\s|$)/)
  if (!match) return { text, priority: 0 }

  const priority = PRIORITY_MAP[match[2]] ?? 0
  const before = text.slice(0, match.index! + match[1].length)
  const after = text.slice(match.index! + match[1].length + match[2].length)
  return { text: before + after, priority }
}

function applyTime(target: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  target.setHours(hours, minutes, 0, 0)
}

function resolveDueDate(
  value: string,
  explicitTime: string | null,
  now: Date,
): ParsedDueDate | null {
  const duration = parseDuration(value)

  if (duration) {
    if (SUB_DAY_UNITS.has(duration.unit)) {
      return {
        dueDate: new Date(now.getTime() + duration.ms),
        hasTime: true,
      }
    }

    const target = new Date(now.getTime() + duration.ms)
    if (explicitTime) {
      applyTime(target, explicitTime)
      return { dueDate: target, hasTime: true }
    }
    target.setHours(0, 0, 0, 0)
    return { dueDate: target, hasTime: false }
  }

  const dateMatch = value.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/)
  if (!dateMatch) return null

  let year = dateMatch[3] ? parseInt(dateMatch[3], 10) : now.getFullYear()
  if (year < 100) year += 2000

  const target = new Date(
    year,
    parseInt(dateMatch[2], 10) - 1,
    parseInt(dateMatch[1], 10),
    0,
    0,
    0,
    0,
  )

  if (explicitTime) {
    applyTime(target, explicitTime)
    return { dueDate: target, hasTime: true }
  }
  return { dueDate: target, hasTime: false }
}

function cleanUrls(text: string) {
  return text.replace(/https?:\/\//g, '').replace(/(\S)\/(?=\s|$)/g, '$1')
}

export function parseInput(input: string): ParsedInput {
  let text = input.trim()

  const { text: afterPriority, priority } = extractPriority(text)
  text = afterPriority

  text = cleanUrls(text)
  text = text.replace(/\s+/g, ' ').trim()

  return { title: text, priority }
}

export function parseDueDate(
  input: string,
  now: Date = new Date(),
): ParsedDueDate | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Split "2d 14:30" into value + optional time
  const match = trimmed.match(
    /^(\d+[smhdw]|\d{1,2}\.\d{1,2}(?:\.\d{2,4})?)(?:\s+(\d{1,2}:\d{2}))?$/,
  )
  if (!match) return null

  return resolveDueDate(match[1], match[2] ?? null, now)
}
