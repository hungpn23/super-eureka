import { defineEventHandler } from 'h3';
import { joinURL } from 'ufo';

export default defineEventHandler(async (event) => {
  return await proxyRequest(
    event,
    joinURL(useRuntimeConfig().apiUrl, event.path),
  );
});
