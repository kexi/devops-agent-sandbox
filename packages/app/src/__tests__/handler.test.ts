import type { APIGatewayProxyEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";

import { handler } from "../handler.js";

const createEvent = (
  queryStringParameters?: Record<string, string>,
): APIGatewayProxyEvent =>
  ({
    queryStringParameters: queryStringParameters ?? null,
  }) as APIGatewayProxyEvent;

describe("handler", () => {
  it("デフォルトで Hello, World! を返す", () => {
    const event = createEvent();
    const result = handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "Hello, World!" });
  });

  it("nameパラメータ付きで挨拶を返す", () => {
    const event = createEvent({ name: "CDK" });
    const result = handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ message: "Hello, CDK!" });
  });

  it("空のnameパラメータではデフォルト応答を返す", () => {
    const event = createEvent({ name: "" });
    const result = handler(event);

    expect(JSON.parse(result.body)).toEqual({ message: "Hello, World!" });
  });

  it("Content-Typeがapplication/jsonである", () => {
    const event = createEvent();
    const result = handler(event);

    expect(result.headers?.["Content-Type"]).toBe("application/json");
  });

  it("ブロックされた名前でUserNotFoundErrorをthrowする", () => {
    const event = createEvent({ name: "error" });

    expect(() => handler(event)).toThrow("User 'error' not found in database");
  });

  it("ブロックされた名前は大文字小文字を区別しない", () => {
    const event = createEvent({ name: "CRASH" });

    expect(() => handler(event)).toThrow("User 'CRASH' not found in database");
  });
});
