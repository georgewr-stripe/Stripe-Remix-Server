// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run the cors middleware
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const { amount, currency, description } =
    typeof req.body == "string" ? JSON.parse(req.body) : req.body;
  try {
    const pi = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
    });
    res.status(200).json({ client_secret: pi.client_secret });
  } catch (e: Stripe.errors.StripeAPIError | any) {
    console.log(e.message);
    res.status(400).json({ error: e.message });
  }
}
