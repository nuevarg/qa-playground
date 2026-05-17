import dayjs from 'dayjs'

export const dateGenerator = {

  generateDate: (daysToAdd = 0) =>
    dayjs()
      .add(Number(daysToAdd), 'day')
      .format('YYYY-MM-DD')
}