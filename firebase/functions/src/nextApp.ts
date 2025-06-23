import * as functions from 'firebase-functions'
import { Request, Response } from 'express'
import next from 'next'

const nextApp = next({
  dev: false,
  conf: {
    distDir: '.next',
  },
})

const handle = nextApp.getRequestHandler()

export const nextAppFunction = functions.https.onRequest(async (req: Request, res: Response) => {
  await nextApp.prepare()
  return handle(req, res)
}) 