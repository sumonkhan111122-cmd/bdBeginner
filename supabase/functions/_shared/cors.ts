const fallbackOrigin = "https://bdbeginner.com";

function configuredOrigin(): string {
  // In development/testing, it's often easier to just allow all origins, or we check if local.
  // For safety in production, we could restrict it, but '*' is fine for most public-facing or auth-protected endpoints.
  return "*";
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": configuredOrigin(),
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};
