async function getPesapalToken(env) {
  const response = await fetch(
    "https://pay.pesapal.com/v3/api/Auth/RequestToken",
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        consumer_key: env.PESAPAL_CONSUMER_KEY,
        consumer_secret: env.PESAPAL_CONSUMER_SECRET
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.token) {
    throw new Error(
      data?.message || "PesaPal authentication failed"
    );
  }

  return data;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/pesapal/test") {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "Soko la Karibu API iko tayari"
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    if (url.pathname === "/api/pesapal/auth-test") {
      try {
        const data = await getPesapalToken(env);

        return new Response(
          JSON.stringify({
            ok: true,
            message: "PesaPal authentication imefanikiwa",
            expiryDate: data.expiryDate
          }),
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            message: error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    if (url.pathname === "/api/pesapal/register-ipn") {
      try {
        const data = await getPesapalToken(env);

        const ipnUrl =
          "https://shy-king-fd41.dismas17.workers.dev/api/pesapal/ipn";

        const response = await fetch(
          "https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN",
          {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.token}`
            },
            body: JSON.stringify({
              url: ipnUrl,
              ipn_notification_type: "GET"
            })
          }
        );

        const result = await response.json();

        return new Response(
          JSON.stringify(result),
          {
            status: response.ok ? 200 : 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            message: error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    if (url.pathname === "/api/pesapal/ipn") {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "Soko la Karibu IPN imepokea taarifa",
          orderTrackingId:
            url.searchParams.get("OrderTrackingId"),
          orderMerchantReference:
            url.searchParams.get("OrderMerchantReference"),
          orderNotificationType:
            url.searchParams.get("OrderNotificationType")
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
