function safeEqual(a = "", b = "") {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);

  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    diff |= (left[i] || 0) ^ (right[i] || 0);
  }

  return diff === 0;
}

function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

function parseBasicAuthHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) {
      return null;
    }
    return {
      user: decoded.slice(0, separatorIndex),
      pass: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const basicUser = env.BASIC_USER || "admin";
    const basicPass = env.BASIC_PASS;

    if (!basicPass) {
      return new Response("Password not configured", { status: 500 });
    }

    const auth = parseBasicAuthHeader(request.headers.get("Authorization"));
    if (!auth) {
      return unauthorized();
    }

    if (!safeEqual(auth.user, basicUser) || !safeEqual(auth.pass, basicPass)) {
      return unauthorized();
    }

    return env.ASSETS.fetch(request);
  },
};
