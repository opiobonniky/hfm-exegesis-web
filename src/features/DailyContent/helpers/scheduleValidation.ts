export function scheduleErrors(date: Date, time: string) {
  return {
    date: Number.isFinite(date.getTime()) ? '' : 'Choose a valid publish date.',
    time: /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ? '' : 'Choose a valid publish time.',
  };
}
