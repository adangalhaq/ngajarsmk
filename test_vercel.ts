async function run() {
  const mod = await import('./server.ts');
  const app = mod.default;
  const req = {
    method: 'POST',
    url: '/auth/login',
    body: { username: 'guru1' }
  };
  const res = {
    status: (code) => ({
      json: (data) => console.log('Response:', code, data)
    }),
    json: (data) => console.log('Response: 200', data)
  };
  
  app(req as any, res as any, () => console.log('Next called'));
}
run();
