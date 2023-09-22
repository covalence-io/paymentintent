import {
    Stripe,
    StripeElements,
    loadStripe,
} from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from './ref';

(function () {
    const el = <HTMLElement>document.getElementById('payment');
    const btn = <HTMLButtonElement>document.getElementById('submit');
    let stripe: Stripe;
    let elements: StripeElements;

    async function load() {
        if (!el) {
            return;
        }

        const rprom = fetch(`/api/v1/users/paymentintent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: 1500,
            }),
        });

        stripe = await loadStripe(STRIPE_PUBLIC_KEY) as Stripe;

        const res = await rprom;
        const data = await res.json();

        elements = stripe?.elements({
            clientSecret: data.clientSecret,
            loader: 'auto',
        });

        const payEl = elements?.create('payment', {
            layout: 'tabs',
            // defaultValues: {
            //     billingDetails: {
            //         name: '',
            //         email: '',
            //     },
            // },
        });

        payEl?.mount(el);
    }

    btn?.addEventListener('click', async () => {
        const sResult = await stripe?.confirmPayment({
            elements,
            redirect: 'if_required',
            confirmParams: {
                return_url: 'http://localhost:3000',
            },
        });

        if (!!sResult?.error) {
            alert(sResult.error.message);
            return;
        }

        const container = document.querySelector('.container');
        const success = document.querySelector('.success');

        if (!!container) {
            container.classList.add('hide');
        }

        if (!!success) {
            success.textContent += ` ${sResult.paymentIntent.id}`;
            success.classList.remove('hide');
        }
    });

    load();
})();