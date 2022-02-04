import { makeExecutableSchema } from '@graphql-tools/schema'
import { printSchema } from 'graphql'
import { descriptionTransformer } from './src'

// test("can document schema", () => {
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

console.log('Before', printSchema(schema))

schema = descriptionTransformer(schema)
// console.log(schema);
console.log('\n\nSepaaaaaaaaaaaaaaaaaaaaaraaaaaaated\n\n')
console.log('After', printSchema(schema))
// });
