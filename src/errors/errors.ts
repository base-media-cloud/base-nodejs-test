export class BaseError extends Error {}

export class RateLimitError extends BaseError {}

export class BackoffRetriesExceededError extends BaseError {}

export class UnauthorizedError extends BaseError {}
