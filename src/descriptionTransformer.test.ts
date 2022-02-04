import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLSchema, Kind, ObjectTypeDefinitionNode, parse, printSchema } from 'graphql'
import { descriptionTransformer } from '..'

describe('descriptionTransformer', () => {
  it('Adds directives as comments', async (): Promise<void> => {
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
    })

    schema = descriptionTransformer(schema)

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
    )
  })
})
