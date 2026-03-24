declare module 'cookie-parser' {
  import type { RequestHandler } from 'express';
  const cookieParser: (secret?: string | string[], options?: unknown) => RequestHandler;
  export default cookieParser;
}

declare module 'cors' {
  import type { RequestHandler } from 'express';
  const cors: (options?: unknown) => RequestHandler;
  export default cors;
}

declare module 'morgan' {
  import type { RequestHandler } from 'express';
  const morgan: (format: string, options?: unknown) => RequestHandler;
  export default morgan;
}

