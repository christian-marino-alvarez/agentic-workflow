export function withErrors<TParams, TResult>(handler: (params: TParams) => Promise<TResult> | TResult) {
  return async (params: TParams): Promise<TResult> => {
    try {
      return await handler(params);
    } catch (error) {
      throw error;
    }
  };
}
