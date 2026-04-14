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

export async function onRequest(context) {
  const basicUser = context.env.BASIC_USER || "admin";
  const basicPass = context.env.BASIC_PASS;

  if (!basicPass) {
    return new Response("Password not configured", { status: 500 });
  }

  const authHeader = context.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorized();
  }

  let user = "";
  let pass = "";
  try {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) {
      return unauthorized();
    }
    user = decoded.slice(0, separatorIndex);
    pass = decoded.slice(separatorIndex + 1);
  } catch {
    return unauthorized();
  }

  if (!safeEqual(user, basicUser) || !safeEqual(pass, basicPass)) {
    return unauthorized();
  }

  return context.next();
}
