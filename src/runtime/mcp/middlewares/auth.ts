export function withAuth<TParams, TResult>(handler: (params: TParams) => Promise<TResult> | TResult) {
  return async (params: TParams): Promise<TResult> => handler(params);
}
