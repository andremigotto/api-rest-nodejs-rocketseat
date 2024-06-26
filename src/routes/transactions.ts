import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { knex } from "../database"
import { randomUUID } from "crypto"
import { checkSessionIdExists } from "../middleware/check-session-id-exists"

export async function transactionsRoutes(app: FastifyInstance) {

  //List all transactions session
  app.get('/',
  {
    preHandler: [checkSessionIdExists]
  },
  async (request) => {

    const { sessionId } = request.cookies

    const transactions = await knex('transactions')
    .where('session_id', sessionId).select()

    return { transactions }
  })

  //Get summary of all transactions
  app.get('/summary',
  {
    preHandler: [checkSessionIdExists]
  },
  async (request) => {
    const { sessionId } = request.cookies
    
    const summary = await knex('transactions')
    .where('session_id', sessionId)
    .sum('amount', {as: 'amount' })
    .first()

    return { summary }
  })

  //Get one specifit transaxtion
  app.get('/:id',
  {
    preHandler: [checkSessionIdExists]
  },
  async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { sessionId } = request.cookies

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions')
    .where({
      session_id: sessionId,
      id,
    })
    .first()

    return { transaction }
  })

  //Making one transaction
  app.post('/', async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(request.body)

    //Checking and adding sessionId on user cookie
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    await knex('transactions')
      .insert({
        id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    })
    
    return response.status(201).send()
  })
}