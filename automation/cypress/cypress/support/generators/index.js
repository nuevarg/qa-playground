import { fakerGenerator } from './fakerGenerator'
import { dateGenerator } from './dateGenerator'

export const generators = {
  ...fakerGenerator,
  ...dateGenerator
}