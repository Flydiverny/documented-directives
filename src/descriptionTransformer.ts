import {
  mapSchema,
  MapperKind,
  getDirectives,
  Maybe,
  DirectiveAnnotation,
} from '@graphql-tools/utils'
import { GraphQLSchema } from 'graphql'

export type DirectiveOptions = {
  exposedFilter: (directive: DirectiveAnnotation) => boolean
}

const updateDescription =
  (schema: GraphQLSchema, { exposedFilter }: DirectiveOptions) =>
  <T extends { description?: Maybe<string> }>(field: T) => {
    const directives = getDirectives(schema, field).filter(exposedFilter)

    if (!directives.length) return field

    const directiveDoc = directives.map((directive) => {
      const args = Object.entries(directive.args ?? {}) as [string, any]

      const argDoc = args.map(([name, value]) => {
        return `${name}: ${value}`
      })

      return `@${directive.name}(${argDoc.join(',')})`
    })

    const doc = directiveDoc.join('\n')

    field.description = field.description
      ? `${field.description}\n\n${doc}`
      : doc

    return field
  }

export const descriptionTransformer = (
  schema: GraphQLSchema,
  { exposedFilter = () => true }: Partial<DirectiveOptions> = {}
) => {
  const descriptionUpdater = updateDescription(schema, { exposedFilter })

  schema = descriptionUpdater(schema)

  return mapSchema(schema, {
    [MapperKind.TYPE]: descriptionUpdater,
    [MapperKind.SCALAR_TYPE]: descriptionUpdater,
    [MapperKind.ENUM_TYPE]: descriptionUpdater,
    [MapperKind.COMPOSITE_TYPE]: descriptionUpdater,
    [MapperKind.OBJECT_TYPE]: descriptionUpdater,
    [MapperKind.INPUT_OBJECT_TYPE]: descriptionUpdater,
    [MapperKind.ABSTRACT_TYPE]: descriptionUpdater,
    [MapperKind.UNION_TYPE]: descriptionUpdater,
    [MapperKind.INTERFACE_TYPE]: descriptionUpdater,
    [MapperKind.ROOT_OBJECT]: descriptionUpdater,
    [MapperKind.QUERY]: descriptionUpdater,
    [MapperKind.MUTATION]: descriptionUpdater,
    [MapperKind.SUBSCRIPTION]: descriptionUpdater,
    [MapperKind.ENUM_VALUE]: descriptionUpdater,
    [MapperKind.FIELD]: descriptionUpdater,
    [MapperKind.OBJECT_FIELD]: descriptionUpdater,
    [MapperKind.ROOT_FIELD]: descriptionUpdater,
    [MapperKind.QUERY_ROOT_FIELD]: descriptionUpdater,
    [MapperKind.MUTATION_ROOT_FIELD]: descriptionUpdater,
    [MapperKind.SUBSCRIPTION_ROOT_FIELD]: descriptionUpdater,
    [MapperKind.INTERFACE_FIELD]: descriptionUpdater,
    [MapperKind.COMPOSITE_FIELD]: descriptionUpdater,
    [MapperKind.ARGUMENT]: descriptionUpdater,
    [MapperKind.INPUT_OBJECT_FIELD]: descriptionUpdater,
    [MapperKind.DIRECTIVE]: descriptionUpdater,
  })
}
