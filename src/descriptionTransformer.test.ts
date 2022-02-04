import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLSchema, printSchema } from 'graphql'
import { descriptionTransformer } from './descriptionTransformer'
import prettier from 'prettier'

const format = (string: string) => prettier.format(string, { semi: false, parser: 'graphql' })

const expectSchema = (schema: GraphQLSchema) => {
  return {
    toMatch(string: string) {
      return expect(format(printSchema(schema))).toEqual(format(string))
    },
  }
}

describe('descriptionTransformer', () => {
  it('Adds directives to description', async (): Promise<void> => {
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

    expectSchema(schema).toMatch(/* GraphQL */ `
      type Query {
        """
        Run Hello World

        @deprecated(reason: No longer supported)
        """
        helloWorld: String @deprecated

        """
        Cow say MOOO
        """
        cowSay: String

        """
        foo bar is cool

        @deprecated(reason: no more foos to give)
        """
        fooBar: String @deprecated(reason: "no more foos to give")
      }
    `)
  })
})
