import { generators }
from '../generators'

const parseDynamicValue = (value) => {

  if (typeof value !== 'string')
    return value

  const regex =
    /\{\{(\w+)\((.*?)\)\}\}/

  const match = value.match(regex)

  if (!match)
    return value

  const [, functionName, rawArgs] = match

  const fn = generators[functionName]

  if (!fn)
    return value

  const args = rawArgs
    ? rawArgs
        .split(',')
        .map(arg => arg.trim())
    : []

  return fn(...args)
}

export const parseDynamicObject = (obj) => {

  if (Array.isArray(obj)) {
    return obj.map(parseDynamicObject)
  }

  if (
    obj !== null &&
    typeof obj === 'object'
  ) {

    const parsed = {}

    Object.keys(obj).forEach((key) => {
      parsed[key] =
        parseDynamicObject(obj[key])
    })

    return parsed
  }

  return parseDynamicValue(obj)
}