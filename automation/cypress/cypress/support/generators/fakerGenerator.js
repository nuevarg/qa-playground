import { faker } from '@faker-js/faker'

export const fakerGenerator = {

  firstname: () =>
    faker.person.firstName(),

  lastname: () =>
    faker.person.lastName(),

  randomPrice: () =>
    faker.number.int({
      min: 100,
      max: 5000
    }),

  boolean: () =>
    faker.datatype.boolean()
}