export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  dedupe?: boolean;
}

export class ApiRequestError extends Error {
  readonly url: string;
  readonly status: number | null;
  readonly retryAfterMs: number | null;

  constructor(
    message: string,
    url: string,
    status: number | null = null,
    retryAfterMs: number | null = null,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.url = url;
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

const inFlightRequests = new Map<string, Promise<unknown>>();

function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;

  const seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const retryDate = Date.parse(value);
  if (Number.isNaN(retryDate)) return null;

  return Math.max(0, retryDate - Date.now());
}

function shouldRetry(status: number): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function executeJsonRequest<T>(
  url: string,
  options: ApiRequestOptions,
): Promise<T> {
  const {
    timeoutMs = 10_000,
    retries = 1,
    retryDelayMs = 1_000,
    dedupe: _dedupe,
    ...requestInit
  } = options;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const externalSignal = requestInit.signal;
    let timedOut = false;

    const cancelRequest = () => controller.abort();

    if (externalSignal?.aborted) {
      controller.abort();
    } else {
      externalSignal?.addEventListener('abort', cancelRequest, {
        once: true,
      });
    }

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...requestInit,
        signal: controller.signal,
      });

      if (!response.ok) {
        const retryAfterMs = parseRetryAfter(
          response.headers.get('Retry-After'),
        );

        const requestError = new ApiRequestError(
          `API request failed with status ${response.status}.`,
          url,
          response.status,
          retryAfterMs,
        );

        if (attempt < retries && shouldRetry(response.status)) {
          const delay =
            retryAfterMs ?? retryDelayMs * Math.pow(2, attempt);

          await wait(delay);
          continue;
        }

        throw requestError;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        throw error;
      }

      if (externalSignal?.aborted) {
        throw new ApiRequestError(
          'The API request was cancelled.',
          url,
        );
      }

      const requestError = new ApiRequestError(
        timedOut
          ? 'The API request timed out.'
          : 'The API request could not reach the server.',
        url,
      );

      if (attempt < retries) {
        await wait(retryDelayMs * Math.pow(2, attempt));
        continue;
      }

      throw requestError;
    } finally {
      clearTimeout(timeout);
      externalSignal?.removeEventListener(
        'abort',
        cancelRequest,
      );
    }
  }

  throw new ApiRequestError('The API request failed.', url);
}

export function fetchJson<T>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const shouldDedupe =
    options.dedupe !== false && method === 'GET';
  const requestKey = `${method}:${url}`;

  if (!shouldDedupe) {
    return executeJsonRequest<T>(url, options);
  }

  const existingRequest = inFlightRequests.get(requestKey);

  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const request = executeJsonRequest<T>(url, options)
    .finally(() => {
      inFlightRequests.delete(requestKey);
    });

  inFlightRequests.set(requestKey, request);
  return request;
}

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiRequestError)) {
    return 'An unexpected error occurred while loading data.';
  }

  if (error.status === 429) {
    return 'The market data service is receiving too many requests. Please wait a moment and try again later.';
  }

  if (error.status === 403) {
    return 'The market data service blocked this request.';
  }

  if (error.status !== null && error.status >= 500) {
    return 'The market data service is temporarily unavailable.';
  }

  if (error.message.includes('timed out')) {
    return 'The market data request timed out. Please try again.';
  }

  return 'Could not connect to the market-data service.';
}