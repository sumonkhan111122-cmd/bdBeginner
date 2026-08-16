// Canonical bKash helper, colocated so the dashboard callback bundle stays self-contained.
export type JsonRecord = Record<string, unknown>;

export type BkashGrantTokenResponse = {
  statusCode: string;
  statusMessage: string;
  id_token: string;
};

export type BkashCreatePaymentResponse = JsonRecord & {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  paymentCreateTime?: string;
};

export type BkashPaymentResult = JsonRecord & {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  trxID: string;
};

export class BkashProviderError extends Error {
  constructor(
    message: string,
    public readonly stage: "GRANT_TOKEN" | "CREATE_PAYMENT" | "EXECUTE_PAYMENT" | "QUERY_PAYMENT",
    public readonly httpStatus?: number,
    public readonly responseCode?: string,
  ) {
    super(message);
    this.name = "BkashProviderError";
  }
}

const requiredNames = [
  "BKASH_USERNAME",
  "BKASH_PASSWORD",
  "BKASH_APP_KEY",
  "BKASH_APP_SECRET",
  "BKASH_BASE_URL",
] as const;

export function missingBkashConfiguration(): string | null {
  return requiredNames.find((name) => !Deno.env.get(name)) ?? null;
}

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The bKash provider returned an invalid response.");
  }
  return value as JsonRecord;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function providerJson(response: Response, stage: BkashProviderError["stage"]): Promise<JsonRecord> {
  let payload: JsonRecord;
  try {
    payload = asRecord(await response.json());
  } catch {
    throw new BkashProviderError("bKash returned an unreadable response.", stage, response.status);
  }
  if (!response.ok) {
    throw new BkashProviderError(
      text(payload.statusMessage) || `bKash request failed with HTTP ${response.status}.`,
      stage,
      response.status,
      text(payload.statusCode) || undefined,
    );
  }
  return payload;
}

export class BkashClient {
  private readonly username = Deno.env.get("BKASH_USERNAME") ?? "";
  private readonly password = Deno.env.get("BKASH_PASSWORD") ?? "";
  private readonly appKey = Deno.env.get("BKASH_APP_KEY") ?? "";
  private readonly appSecret = Deno.env.get("BKASH_APP_SECRET") ?? "";
  private readonly baseUrl = (Deno.env.get("BKASH_BASE_URL") ?? "").replace(/\/$/, "");

  async grantToken(): Promise<BkashGrantTokenResponse> {
    const response = await fetch(`${this.baseUrl}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json", username: this.username, password: this.password },
      body: JSON.stringify({ app_key: this.appKey, app_secret: this.appSecret }),
    });
    const payload = await providerJson(response, "GRANT_TOKEN");
    const statusCode = text(payload.statusCode);
    if (statusCode !== "0000" || !text(payload.id_token)) {
      throw new BkashProviderError(text(payload.statusMessage) || "bKash Grant Token failed.", "GRANT_TOKEN", response.status, statusCode || undefined);
    }
    return {
      statusCode,
      statusMessage: text(payload.statusMessage),
      id_token: text(payload.id_token),
    };
  }

  async createPayment(idToken: string, requestBody: {
    mode: string;
    payerReference: string;
    callbackURL: string;
    amount: string;
    currency: string;
    intent: string;
    merchantInvoiceNumber: string;
  }): Promise<BkashCreatePaymentResponse> {
    const response = await fetch(`${this.baseUrl}/tokenized/checkout/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: idToken, "X-APP-Key": this.appKey },
      body: JSON.stringify(requestBody),
    });
    const payload = await providerJson(response, "CREATE_PAYMENT");
    const statusCode = text(payload.statusCode);
    if (statusCode !== "0000" || !text(payload.paymentID)) {
      throw new BkashProviderError(text(payload.statusMessage) || "bKash Create Payment failed.", "CREATE_PAYMENT", response.status, statusCode || undefined);
    }
    return {
      ...payload,
      statusCode,
      statusMessage: text(payload.statusMessage),
      paymentID: text(payload.paymentID),
      paymentCreateTime: text(payload.paymentCreateTime) || undefined,
    };
  }

  async executePayment(idToken: string, paymentID: string): Promise<BkashPaymentResult> {
    const response = await fetch(`${this.baseUrl}/tokenized/checkout/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: idToken, "X-APP-Key": this.appKey },
      body: JSON.stringify({ paymentID }),
    });
    const payload = await providerJson(response, "EXECUTE_PAYMENT");
    return this.paymentResult(payload);
  }

  async queryPayment(idToken: string, paymentID: string): Promise<BkashPaymentResult> {
    const response = await fetch(`${this.baseUrl}/tokenized/checkout/payment/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: idToken, "X-APP-Key": this.appKey },
      body: JSON.stringify({ paymentID }),
    });
    const payload = await providerJson(response, "QUERY_PAYMENT");
    return this.paymentResult(payload);
  }

  paymentUrl(payload: BkashCreatePaymentResponse): string | null {
    const candidates = [payload.bkashURL, payload.paymentURL, payload.paymentUrl];
    for (const candidate of candidates) {
      if (typeof candidate !== "string") continue;
      try {
        const url = new URL(candidate);
        if (url.protocol === "https:") return url.toString();
      } catch {
        // Continue checking documented provider URL fields.
      }
    }
    return null;
  }

  private paymentResult(payload: JsonRecord): BkashPaymentResult {
    return {
      ...payload,
      statusCode: text(payload.statusCode),
      statusMessage: text(payload.statusMessage),
      paymentID: text(payload.paymentID),
      transactionStatus: text(payload.transactionStatus),
      amount: text(payload.amount),
      currency: text(payload.currency),
      trxID: text(payload.trxID),
    };
  }
}
