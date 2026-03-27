export class AICommitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AICommitError';
  }
}

export class GitError extends AICommitError {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}

export class ConfigError extends AICommitError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class APIError extends AICommitError {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends AICommitError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
