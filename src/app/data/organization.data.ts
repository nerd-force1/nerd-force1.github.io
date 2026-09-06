/**
 * The company as a schema.org entity, shared by the site-wide graph (SeoService) and
 * the team page. One `@id` for nerd_force1 across every AI-Gruppe site — the value
 * below is what auto-intern.de and the team members' own sites already reference, so
 * it stays on the .de host even though the site now lives on nerd-force1.com.
 */
export const ORIGIN = 'https://nerd-force1.com';
export const ORGANIZATION_ID = 'https://www.nerd-force1.de/#organization';
export const WEBSITE_ID = `${ORIGIN}/#website`;
export const AI_GRUPPE_BRAND_ID = 'https://gruppe.ai/#brand';
export const AUTO_INTERN_ID = 'https://www.auto-intern.de/#organization';

export const organizationNode = () => ({
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'nerd_force1 UG',
  legalName: 'nerd_force1 UG (haftungsbeschränkt)',
  alternateName: ['Nerd-Force1', 'nerd_force1', 'nerd-force1'],
  url: `${ORIGIN}/`,
  logo: `${ORIGIN}/brand/nf1-logo.png`,
  description:
    'Managed sovereign infrastructure from Bochum, Germany: self-hosted platforms built and operated as code — identity and secrets (Vault, Keycloak, NetBird), GitOps Kubernetes (RKE2, Argo CD, Ceph), security operations (Wazuh, OpenCTI) and self-hosted collaboration apps. Marketing, shop and hosting service provider of the AI-Gruppe; operates the Shopware shops of Auto-Intern GmbH.',
  foundingDate: '2020',
  email: 'contact@nerd-force1.de',
  telephone: '+49-234-93451160',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Herner Str. 299, Gebäude B29',
    postalCode: '44809',
    addressLocality: 'Bochum',
    addressRegion: 'NRW',
    addressCountry: 'DE',
  },
  vatID: 'DE815744003',
  identifier: { '@type': 'PropertyValue', propertyID: 'Handelsregister', value: 'Amtsgericht Bochum HRB 16979' },
  brand: { '@id': AI_GRUPPE_BRAND_ID },
  knowsAbout: [
    'Kubernetes', 'GitOps', 'RKE2', 'Argo CD', 'Ceph', 'HashiCorp Vault', 'Keycloak', 'NetBird',
    'Traefik', 'Wazuh', 'OpenCTI', 'Nextcloud', 'GitLab', 'Shopware', 'Infrastructure as Code',
    'Managed Detection and Response', 'Sovereign Cloud',
  ],
  sameAs: ['https://nerd-force1.de/', 'https://www.linkedin.com/company/nerd-force1/', 'https://github.com/nerd-force1'],
});

export const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${ORIGIN}/`,
  name: 'Nerd-Force1',
  inLanguage: ['de', 'en'],
  publisher: { '@id': ORGANIZATION_ID },
});

/** Referenced-only nodes so every `@id` in the graph resolves on the page itself. */
export const relatedNodes = () => [
  {
    '@type': 'Brand',
    '@id': AI_GRUPPE_BRAND_ID,
    name: 'AI-Gruppe',
    url: 'https://gruppe.ai/',
    description:
      'Umbrella brand (not a legal entity) for Auto-Intern GmbH, CCD Car Diagnostics, nabla B, nerd_force1 and the skAInet project. Herner Str. 299, Gebäude B29, 44809 Bochum.',
  },
  {
    '@type': 'Organization',
    '@id': AUTO_INTERN_ID,
    name: 'Auto-Intern GmbH',
    url: 'https://www.auto-intern.de/',
    brand: { '@id': AI_GRUPPE_BRAND_ID },
  },
];
