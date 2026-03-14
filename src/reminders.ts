import { runAppleScript } from '@raycast/utils'

function escapeAppleScript(str: string) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}

export async function ensureList(listName: string) {
  const escaped = escapeAppleScript(listName)
  try {
    await runAppleScript(`
      tell application "Reminders"
        if not (exists list "${escaped}") then
          make new list with properties {name:"${escaped}"}
        end if
      end tell
    `)
  } catch {
    throw new Error(
      `Could not create list "${listName}". Please create it manually in Apple Reminders.`,
    )
  }
}

function buildDateSetup(dueDate: Date, hasTime: boolean) {
  const y = dueDate.getFullYear()
  const m = dueDate.getMonth() + 1
  const d = dueDate.getDate()

  const setup = `
        set d to current date
        set year of d to ${y}
        set month of d to ${m}
        set day of d to ${d}
        set hours of d to ${hasTime ? dueDate.getHours() : 0}
        set minutes of d to ${hasTime ? dueDate.getMinutes() : 0}
        set seconds of d to 0`

  // allday due date = date without time; due date = date with specific time
  const props = hasTime
    ? ['due date:d', 'remind me date:d']
    : ['allday due date:d']

  return { setup, props }
}

export async function createReminder(params: {
  title: string
  listName: string
  priority: number
  dueDate: Date | null
  hasTime: boolean
}) {
  const { title, listName, priority, dueDate, hasTime } = params

  const escapedTitle = escapeAppleScript(title)
  const escapedList = escapeAppleScript(listName)

  const props: string[] = [`name:"${escapedTitle}"`]
  let dateSetup = ''

  if (priority > 0) {
    props.push(`priority:${priority}`)
  }

  if (dueDate) {
    const date = buildDateSetup(dueDate, hasTime)
    dateSetup = date.setup
    props.push(...date.props)
  }

  await runAppleScript(
    `
    tell application "Reminders"
      tell list "${escapedList}"${dateSetup}
        make new reminder with properties {${props.join(', ')}}
      end tell
    end tell
  `,
    { timeout: 10000 },
  )
}
