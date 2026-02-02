export type ViewStage = 'resolve' | 'connect' | 'ready';

export type ServerEventRegistrar = (
  event: string,
  handler: (payload: unknown) => void
) => { dispose: () => void } | void;
