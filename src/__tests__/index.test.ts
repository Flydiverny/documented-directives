import { makeExecutableSchema } from "@graphql-tools/schema";
import { printSchema } from "graphql";
import { descriptionTransformer } from "..";

describe("descriptionTransformer", () => {
  it("Adds directives as comments", async (): Promise<void> => {
    let schema = makeExecutableSchema({
      typeDefs: [
        `
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

    expect(printSchema(schema)).toEqual(
      `
type Query {
  """
  Run Hello World
  
  @deprecated(reason: No longer supported)
  """
  helloWorld: String @deprecated

  """Cow say MOOO"""
  cowSay: String

  """
  foo bar is cool
  
  @deprecated(reason: no more foos to give)
  """
  fooBar: String @deprecated(reason: "no more foos to give")
}
    `.trim()
    );
  });

  it("Supports a custom exposedFilter", async (): Promise<void> => {
    let schema = makeExecutableSchema({
      typeDefs: [
        `
          enum Role {
            ADMIN
          }

          directive @requireAuth(role: Role) on FIELD_DEFINITION

          type Query {
            "Run Hello World"
            helloWorld: String @deprecated
            "Cow say MOOO"
            cowSay: String @requireAuth(role: ADMIN)
            "foo bar is cool"
            fooBar: String @deprecated(reason: "no more foos to give")
          }
        `,
      ],
      resolvers: {},
    });

    schema = descriptionTransformer(schema, {
      exposedFilter: (directive) => ["requireAuth"].includes(directive.name),
    });

    expect(printSchema(schema)).toEqual(
      `
directive @requireAuth(role: Role) on FIELD_DEFINITION

enum Role {
  ADMIN
}

type Query {
  """Run Hello World"""
  helloWorld: String @deprecated

  """
  Cow say MOOO
  
  @requireAuth(role: ADMIN)
  """
  cowSay: String

  """foo bar is cool"""
  fooBar: String @deprecated(reason: "no more foos to give")
}
    `.trim()
    );
  });
});
