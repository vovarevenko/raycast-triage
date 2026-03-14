import {
  closeMainWindow,
  getPreferenceValues,
  LaunchProps,
  showToast,
  Toast,
} from '@raycast/api'
import { parseInput } from './parse-input'
import { createReminder, ensureList } from './reminders'

interface Arguments {
  text: string
}

interface Preferences {
  listName: string
}

export default async function Command(
  props: LaunchProps<{ arguments: Arguments }>,
) {
  const { text } = props.arguments
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

    await ensureList(listName)
    await createReminder({ ...parsed, listName })

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
