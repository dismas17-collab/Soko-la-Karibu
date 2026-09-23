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
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
