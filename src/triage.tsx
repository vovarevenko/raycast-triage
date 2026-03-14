import {
  closeMainWindow,
  getPreferenceValues,
  LaunchProps,
  showToast,
  Toast,
} from '@raycast/api'
import { parseDueDate, parseInput } from './parse-input'
import { createReminder, ensureList } from './reminders'

interface Arguments {
  text: string
  due?: string
}

interface Preferences {
  listName: string
}

export default async function Command(
  props: LaunchProps<{ arguments: Arguments }>,
) {
  const { text, due } = props.arguments
  const { listName } = getPreferenceValues<Preferences>()

  await closeMainWindow()

  try {
    const parsed = parseInput(text)

    if (!parsed.title) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Empty reminder',
        message: 'Reminder text is empty after parsing',
      })
      return
    }

    const dueResult = due ? parseDueDate(due) : null

    await ensureList(listName)
    await createReminder({
      title: parsed.title,
      listName,
      priority: parsed.priority,
      dueDate: dueResult?.dueDate ?? null,
      hasTime: dueResult?.hasTime ?? false,
    })

    await showToast({
      style: Toast.Style.Success,
      title: 'Reminder created',
      message: parsed.title,
    })
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: 'Failed to create reminder',
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
