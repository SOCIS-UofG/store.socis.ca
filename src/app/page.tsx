"use client";

import { Stripe, loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Status type
 */
type Status = "idle" | "loading" | "success" | "error";

/**
 * Home page
 *
 * @returns {JSX.Element} The home page
 */
export default function HomePage() {
  const params = useSearchParams();
  const status = params.get("status");
  const [checkoutStatus, setCheckoutStatus] = useState<Status>(
    status === "success" ? "success" : status === "error" ? "error" : "idle"
  );

  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (stripe) {
      return;
    }

    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string).then(
      (stripeTmp) => {
        setStripe(stripeTmp);
      }
    );
  }, [stripe]);

  const buyButtonIds = [
    "price_1OsVzICffd2qTSKTM0f7ejN7",
    "price_1OsW1TCffd2qTSKTCsRI2Fva",
    "price_1OsW2fCffd2qTSKTfQqded29",
    "price_1OsW3mCffd2qTSKTlFIdqKrb",
    "price_1OsW4uCffd2qTSKTwgfKMtuM",
    "price_1OsW5uCffd2qTSKTPjUMKU52",
    "price_1OsW6yCffd2qTSKTJFIxSHHt",
    "price_1OsW82Cffd2qTSKTMxQr9zbo",
  ];

  /**
   * Create a checkout session
   */
  const onCheckout = async (id: string) => {
    if (!stripe) {
      setCheckoutStatus("error");
      setError("Stripe is not initialized");

      return;
    }

    stripe
      .redirectToCheckout({
        lineItems: [{ price: id, quantity: 1 }],
        mode: "payment",
        successUrl: `${window.location.origin}?status=success`,
        cancelUrl: `${window.location.origin}?status=error&error=cancelled`,
      })
      .then((result) => {
        if (result.error) {
          setCheckoutStatus("error");
          setError(result.error.message as string);
        }
      });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-5xl font-bold">SOCIS Store</h1>
      <p className="text-2xl">
        Welcome to the SOCIS Store! Here you can find all the latest SOCIS
        merchandise.
      </p>
      <div className="grid grid-cols-2 gap-4 mt-8">
        {buyButtonIds.map((id) => (
          <button
            key={id}
            id={id}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={async () => {
              setCheckoutStatus("loading");

              await onCheckout(id);
            }}
          >
            Purchase
          </button>
        ))}
      </div>

      {checkoutStatus === "loading" && (
        <p className="text-2xl mt-8">Processing payment...</p>
      )}

      {checkoutStatus === "success" && (
        <p className="text-2xl mt-8">Payment successful!</p>
      )}

      {checkoutStatus === "error" && (
        <p className="text-2xl mt-8 text-red-500">{error}</p>
      )}
    </main>
  );
}
