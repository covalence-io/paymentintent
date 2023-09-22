import { Router } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY as string, {
    apiVersion: '2023-08-16',
    typescript: true,
});

export default function users() {
    const router = Router();

    router
        .get('/', (req, res, next) => {
            res.json({
                id: 1,
                firstname: 'Matt',
                lastname: 'Morgan',
            });
        })
        .post('/paymentintent', async (req, res, next) => {
            const model = req.body;

            try {
                const p = await stripe.paymentIntents.create({
                    amount: model.amount,
                    currency: model.currency || 'USD',
                    automatic_payment_methods: {
                        enabled: true,
                    },
                });

                res.send({
                    clientSecret: p?.client_secret,
                });
            } catch(e) {
                res.status(500).send({});
            }
        });

    return router;
}