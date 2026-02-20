require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const products = require("./products.json");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());          
app.use(express.json());

app.get("/products", (req, res) => {
  res.json(products);
});


app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;

    const line_items = cart.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity),
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
    success_url: "https://maxmresells.netlify.app/success.html",
    cancel_url: "https://maxmresells.netlify.app/cancel.html",
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => {
  console.log("ReThrift backend is running 🚀");
});
