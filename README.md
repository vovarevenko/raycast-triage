# Triage

Quickly capture reminders to Apple Reminders with priority and due dates. Type, press Enter, move on.

## Usage

Open Raycast, type **Triage**, then enter your reminder text in the first argument. Optionally set a due date in the second argument.

### Text argument

| Feature           | Syntax        | Example                                        |
| ----------------- | ------------- | ---------------------------------------------- |
| Priority (high)   | `!!!`         | `Fix the printer!!!`                           |
| Priority (medium) | `!!`          | `Deploy hotfix !!`                             |
| Priority (low)    | `!`           | `Update docs !`                                |
| URL cleanup       | paste any URL | `https://example.com/foo/` → `example.com/foo` |

Priority markers can appear anywhere in the text and are removed from the final reminder title.

### Due date argument (optional)

| Format             | Example       | Result                      |
| ------------------ | ------------- | --------------------------- |
| Relative (minutes) | `20m`         | 20 minutes from now         |
| Relative (hours)   | `2h`          | 2 hours from now            |
| Relative (days)    | `1d`          | tomorrow (date only)        |
| Relative (weeks)   | `1w`          | 1 week from now (date only) |
| Relative (years)   | `1y`          | 1 year from now (date only) |
| Relative + time    | `2d 14:30`    | 2 days from now at 14:30    |
| Absolute           | `20.09`       | September 20, current year  |
| Absolute + year    | `20.09.26`    | September 20, 2026          |
| Absolute + time    | `20.09 14:00` | September 20 at 14:00       |

Sub-day durations (seconds, minutes, hours) include the exact time. Day+ durations set only the date unless explicit time is provided.

## Preferences

| Name           | Description                              | Default  |
| -------------- | ---------------------------------------- | -------- |
| Reminders List | Apple Reminders list to add reminders to | `Triage` |

If the configured list doesn't exist, the extension will create it automatically.

## Permissions

On first use, macOS will prompt you to grant Reminders access. Go to **System Settings → Privacy & Security → Reminders** if you need to manage this later.
