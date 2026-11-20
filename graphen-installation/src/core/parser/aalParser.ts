import * as yaml from 'js-yaml'
import { aalSchema, type AalAgent, type AalDocument, type AalModel } from '../types/aal.schema'

export class AalParseError extends Error {
  readonly issues: string[]
  readonly location?: { line: number; column: number }

  constructor(issues: string[], location?: { line: number; column: number }) {
    super(issues.join('\n'))
    this.name = 'AalParseError'
    this.issues = issues
    this.location = location
  }
}

export function parseAal(source: string): AalDocument {
  let value: unknown

  try {
    value = yaml.load(source)
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      const location = error.mark
        ? { line: error.mark.line + 1, column: error.mark.column + 1 }
        : undefined
      const prefix = location ? `Line ${location.line}, column ${location.column}` : 'YAML'
      throw new AalParseError([`${prefix}: ${error.reason}`], location)
    }
    throw error
  }

  const result = aalSchema.safeParse(value)
  if (!result.success) {
    throw new AalParseError(result.error.issues.map(({ path, message }) => {
      const field = path.reduce<string>(
        (current, part) => typeof part === 'number' ? `${current}[${part}]` : `${current}${current ? '.' : ''}${String(part)}`,
        '',
      )
      return `${field || 'document'}: ${message}`
    }))
  }

  return result.data
}

export function resolveAgentModel(document: AalDocument, agent: AalAgent): AalModel | undefined {
  return document.models?.find((model) => model.id === agent.model)
}
