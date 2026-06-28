import { PlatformAdapter } from "./index";

async function fetchWithTimeoutAndRetry(
  url: string,
  timeoutMs: number,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<Response> {
  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        return res;
      }

      const isTransient = [429, 502, 503, 504].includes(res.status);
      if (isTransient && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return res;
    } catch (err) {
      clearTimeout(timer);

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }
}

export const CodeforcesAdapter: PlatformAdapter = {
  platformId: "codeforces",

  async fetchProfile(handle: string) {
    const encodedHandle = encodeURIComponent(handle);
    let res: Response;

    try {
      res = await fetchWithTimeoutAndRetry(
        `https://codeforces.com/api/user.info?handles=${encodedHandle}`,
        8000,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      throw new Error(`Could not reach Codeforces API: ${message}`, {
        cause: err,
      });
    }

    if (!res.ok) {
      throw new Error(
        `Codeforces API returned ${res.status}. The service may be temporarily unavailable.`,
      );
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new Error("Codeforces API returned an unreadable response.");
    }

    const payload = data as {
      status: string;
      comment?: string;
      result?: { handle: string; rating?: number; avatar?: string }[];
    };

    if (payload.status !== "OK") {
      const comment = payload.comment ?? "";
      if (comment.toLowerCase().includes("not found")) {
        throw new Error(`No Codeforces account found for "${handle}".`);
      }
      throw new Error(payload.comment || "Codeforces API error.");
    }

    const user = payload.result?.[0];
    if (!user?.handle) {
      throw new Error("Codeforces API returned an unexpected response shape.");
    }

    return {
      handle: user.handle,
      rating: user.rating ?? null,
      avatar: user.avatar ?? null,
    };
  },
};
