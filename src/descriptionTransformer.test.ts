import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLSchema, printSchema } from 'graphql'
import { descriptionTransformer } from './descriptionTransformer'
import prettier from 'prettier'

const format = (string: string) =>
  prettier.format(string, { semi: false, parser: 'graphql' })

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

  it('Supports a custom exposedFilter', async (): Promise<void> => {
    let schema = makeExecutableSchema({
      typeDefs: [
        /* GraphQL */ `
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
    })

    schema = descriptionTransformer(schema, {
      exposedFilter: (directive) => ['requireAuth'].includes(directive.name),
    })

    expectSchema(schema).toMatch(/* GraphQL */ `
      directive @requireAuth(role: Role) on FIELD_DEFINITION

      enum Role {
        ADMIN
      }

      type Query {
        """
        Run Hello World
        """
        helloWorld: String @deprecated

        """
        Cow say MOOO

        @requireAuth(role: ADMIN)
        """
        cowSay: String

        """
        foo bar is cool
        """
        fooBar: String @deprecated(reason: "no more foos to give")
      }
    `)
  })
})
