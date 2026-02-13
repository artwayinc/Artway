// Required for opennextjs-cloudflare build (CI has no interactive prompt)
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
  incrementalCache: "dummy",
});
