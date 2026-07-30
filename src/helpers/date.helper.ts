export const getPHDateString = () => {
  const options = {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  } as const
  const formatter = new Intl.DateTimeFormat('en-CA', options)
  return formatter.format(new Date())
}

export const getLocalTimeZoneDateString = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const options = {
    timeZone: userTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  } as const
  const formatter = new Intl.DateTimeFormat('en-CA', options)
  return formatter.format(new Date())
}

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateRange = (
  start: string | null | undefined,
  end: string | null | undefined
): string => {
  if (!start || !end) return 'N/A'

  const startDate = new Date(start)
  const endDate = new Date(end)

  const formatter = new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return formatter.formatRange(startDate, endDate)
}