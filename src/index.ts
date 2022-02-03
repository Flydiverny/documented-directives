import {
  mapSchema,
  MapperKind,
  getDirectives,
  Maybe,
} from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";

const updateDescription =
  (schema: GraphQLSchema, exposedDirectives: string[]) =>
  <T extends { description?: Maybe<string> }>(field: T) => {
    const directives = getDirectives(schema, field).filter((directive) =>
      exposedDirectives.includes(directive.name)
    );

    if (!directives.length) return field;

    const directiveDoc = directives.map((directive) => {
      const args = Object.entries(directive.args ?? {}) as [string, any];

      const argDoc = args.map(([name, value]) => {
        return `${name}: ${value}`;
      });

      return `@${directive.name}(${argDoc.join(",")})`;
    });

    const doc = directiveDoc.join("\n");

    field.description = field.description
      ? `${field.description}\n\n${doc}`
      : doc;

    return field;
  };

export const descriptionTransformer = (
  schema: GraphQLSchema,
  exposedDirectives?: string[]
) => {
  exposedDirectives ??= schema
    .getDirectives()
    .map((directive) => directive.name);

  if (!exposedDirectives.length) {
    return schema;
  }

  const descriptionUpdater = updateDescription(schema, exposedDirectives);

  schema = descriptionUpdater(schema);

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
  });
};
