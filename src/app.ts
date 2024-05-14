import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions'
import cookie from "@fastify/cookie"

export const app = fastify()

//Adding cookie for register
app.register(cookie)

//Adding routes for register
app.register(transactionsRoutes, {
  prefix: 'transactions',
})