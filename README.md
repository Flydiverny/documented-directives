## Why?

When using schema introspection sadly directives that are applied in the schema is not exposed.
As an API consumer this can be very useful information if for example you have a directive for @auth(role: "Admin")


## Example
```ts
import { makeExecutableSchema } from "@graphql-tools/schema";
import { printSchema } from "graphql";
import { descriptionTransformer } from "./src";

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
  resolvers: {
  },
});

schema = descriptionTransformer(schema);

// Alternatively supply a filter for which directives should be exposed in the
// description. Defaults to exposing all fields.
schema = descriptionTransformer(schema, {
  exposedFilter: (directive) => directive.name === "deprecated",
});

printSchema(schema)
```

Expected schema output
```graphql
type Query {
  """
  Run Hello World

  @deprecated(reason: "No longer supported")
  """
  helloWorld: String @deprecated

  """Cow say MOOO"""
  cowSay: String

  """
  foo bar is cool

  @deprecated(reason: "no more foos to give")
  """
  fooBar: String @deprecated(reason: "no more foos to give")
}
```
