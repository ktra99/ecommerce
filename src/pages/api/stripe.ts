const stripe = require('stripe')(process.env.STRIPE_SECRET);
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
){
  if(req.method === "POST"){
    const { line_items } = req.body
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: process.env.SITE_URL,
      cancel_url: process.env.SITE_URL,
    });
    return res.status(200).json({
      url: session.url
    })
  }
  else{
    res.status(501).send("request method is not supported")
  }
}