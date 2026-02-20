import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

class UserNotFoundError extends Error {
  constructor(name: string) {
    super(`User '${name}' not found in database`);
    this.name = "UserNotFoundError";
  }
}

const BLOCKED_NAMES = ["error", "fail", "crash"];

export const handler = (
  event: APIGatewayProxyEvent,
): APIGatewayProxyResult => {
  const name = event.queryStringParameters?.["name"];
  const hasName = name !== undefined && name !== "";

  const isBlockedName = hasName && BLOCKED_NAMES.includes(name.toLowerCase());
  if (isBlockedName) {
    // Simulate an unhandled database lookup failure
    throw new UserNotFoundError(name);
  }

  const message = hasName ? `Hello, ${name}!` : "Hello, World!";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  };
};
