export const isDateBiggerThanOrEquals = (currentDate: Date, nextDate: Date, differenceInHours: number) => {
  const diffInMs = nextDate.getTime() - currentDate.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)
  return diffInHours >= differenceInHours
}
