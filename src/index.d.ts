export interface NotExistOptions {
  registry?: string;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export class RegistryResponseError extends Error {
  readonly status: number;
  readonly url: string;
}

export function notExist(name: string, options?: NotExistOptions): Promise<boolean>;
export default notExist;
