/** Ambient types so the IDE can open Edge Functions without the Deno extension. */

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
  function serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

/** Untyped client — Edge runtime resolves these; no DB generics in this package. */
declare module "npm:@supabase/supabase-js@2.49.1" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function createClient(...args: any[]): any;
}

declare module "https://esm.sh/@supabase/supabase-js@2.49.1" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function createClient(...args: any[]): any;
}
