import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  GraphQLSchema,
  Kind,
  ObjectTypeDefinitionNode,
  parse,
  printSchema,
} from "graphql";
import { descriptionTransformer } from "..";

function getFieldValuePairs(
  schema: GraphQLSchema,
  type: string
): [string, string][] {
  const parsedSchema = parse(printSchema(schema));

  const typeNode = parsedSchema.definitions.find(
    (definition): definition is ObjectTypeDefinitionNode =>
      definition.kind === Kind.OBJECT_TYPE_DEFINITION &&
      definition.name.value === type
  );

  return typeNode.fields.map((field) => {
    return [field.name.value, field.description.value];
  });
}

describe("descriptionTransformer", () => {
  it("Adds directives as comments", async (): Promise<void> => {
    let schema = makeExecutableSchema({
      typeDefs: [
        /* GraphQL */ `
          type Query {
            "Run Hello World"
            helloWorld: String @deprecated
            "Cow say MOOO"
            cowSay: String
            "foo bar is cool"
            fooBar: String @deprecated(reason: "no more foos to give")
          }
        `,
      ],
      resolvers: {},
    });

    schema = descriptionTransformer(schema);
    expect(getFieldValuePairs(schema, "Query")).toEqual([
      [
        "helloWorld",
        "Run Hello World\n\n@deprecated(reason: No longer supported)",
      ],
      ["cowSay", "Cow say MOOO"],
      [
        "fooBar",
        "foo bar is cool\n\n@deprecated(reason: no more foos to give)",
      ],
    ]);
  });
});
