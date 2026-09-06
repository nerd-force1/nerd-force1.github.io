import { routes } from './app.routes';

describe('retired routes', () => {
  it('redirects /termin to the localized contact page instead of 404ing', () => {
    const termin = routes.find(r => r.path === 'termin');
    expect(termin).toBeDefined();
    expect(termin!.redirectTo).toBe('/de/contact');
    expect(termin!.pathMatch).toBe('full');
  });

  it('no longer lazy-loads a termin page', () => {
    expect(routes.find(r => r.path === 'termin')!.loadComponent).toBeUndefined();
  });

  it('redirects the bare root to the default locale', () => {
    const root = routes.find(r => r.path === '');
    expect(root!.redirectTo).toBe('/de');
    expect(root!.pathMatch).toBe('full');
  });
});
