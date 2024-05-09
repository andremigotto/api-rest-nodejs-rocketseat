/* eslint-disable prettier/prettier */
import fastify from 'fastify'
import { knex } from './database'
import crypto from 'node:crypto'
import { title } from 'node:process'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  const transaction = await knex('transactions').select('*')

  return transaction
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })