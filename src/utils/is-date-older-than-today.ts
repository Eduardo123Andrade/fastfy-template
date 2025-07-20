export const isDateOlderThanToday = (date: Date) => {
  return date.getTime() >= Date.now()
}
