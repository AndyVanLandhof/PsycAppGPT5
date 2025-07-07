// middleware.js
export function middleware(request) {
  const basicAuth = request.headers.get('authorization');
  const USER = process.env.BASIC_AUTH_USER || 'phoebs1906';      // Set your username
  const PASS = process.env.BASIC_AUTH_PASS || 'Milomaia10';  // Set your password

  if (basicAuth) {
    const [, b64auth] = basicAuth.split(' ');
    const [user, pass] = atob(b64auth).split(':');
    if (user === USER && pass === PASS) {
      return; // Allow request to continue
    }
  }
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}