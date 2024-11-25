export function decodeJwt(token: string): any {
    const split = token.split(".");
    const payloadEncoded = split[1];

    const payload = Buffer.from(payloadEncoded, "base64").toString("utf8");

    return JSON.parse(payload);
}
