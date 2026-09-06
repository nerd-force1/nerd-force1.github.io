/**
 * The five service pillars as schema.org Service entities, one language-neutral `@id`
 * each (`<origin>/#service-<slug>`) so /de/... and /en/... describe the same node.
 * Guide prices mirror public/api/catalog.json (`base_monthly`) — update both together.
 */
import { ORGANIZATION_ID, ORIGIN } from './organization.data';
import type { PillarSlug } from './pillars.data';

export interface ServiceEntity {
  readonly slug: PillarSlug;
  readonly name: string;
  readonly description: { readonly de: string; readonly en: string };
  /** Guide price in EUR per month; undefined = priced per project. */
  readonly monthlyFrom?: number;
}

export const SERVICES: readonly ServiceEntity[] = [
  {
    slug: 'core-platform',
    name: 'Core Platform',
    description: {
      de: 'Identität, Secrets und Netzwerk: HashiCorp Vault, Keycloak SSO, NetBird Mesh-VPN, Traefik mit automatischem TLS.',
      en: 'Identity, secrets and network: HashiCorp Vault, Keycloak SSO, NetBird mesh VPN, Traefik with automatic TLS.',
    },
    monthlyFrom: 1500,
  },
  {
    slug: 'gitops-k8s',
    name: 'GitOps Kubernetes',
    description: {
      de: 'Privates Cloud-Cluster: RKE2 HA, Cilium, Argo CD GitOps, Ceph-Storage, cert-manager, Rancher, kube-prometheus-stack.',
      en: 'Private cloud cluster: RKE2 HA, Cilium, Argo CD GitOps, Ceph storage, cert-manager, Rancher, kube-prometheus-stack.',
    },
    monthlyFrom: 3500,
  },
  {
    slug: 'security-ops',
    name: 'Security Operations',
    description: {
      de: 'Managed Detection & Response: Wazuh SIEM/XDR, OpenCTI Threat Intelligence, zentrales Log-Management, Alerting und Incident-Playbooks.',
      en: 'Managed detection and response: Wazuh SIEM/XDR, OpenCTI threat intelligence, centralised log management, alerting and incident playbooks.',
    },
    monthlyFrom: 2500,
  },
  {
    slug: 'collab-apps',
    name: 'Collaboration & Apps',
    description: {
      de: 'Selbst gehostete Team-Werkzeuge: Nextcloud mit SSO, Paperless-ngx, GitLab CE und Harbor, Vaultwarden, Monitoring-Dashboards.',
      en: 'Self-hosted team tools: Nextcloud with SSO, Paperless-ngx, GitLab CE and Harbor, Vaultwarden, monitoring dashboards.',
    },
    monthlyFrom: 900,
  },
  {
    slug: 'custom',
    name: 'Custom Engineering',
    description: {
      de: 'Legacy-Migrationen, Air-Gapped- und On-Prem-Deployments, Spezialintegrationen, Infrastruktur-Audits und Beratung. Preis je Projekt.',
      en: 'Legacy migrations, air-gapped and on-prem deployments, bespoke integrations, infrastructure audits and consulting. Priced per project.',
    },
  },
];

export const serviceId = (slug: PillarSlug) => `${ORIGIN}/#service-${slug}`;

export const serviceNodes = (locale: 'de' | 'en') =>
  SERVICES.map((s) => ({
    '@type': 'Service',
    '@id': serviceId(s.slug),
    name: s.name,
    description: s.description[locale],
    serviceType: s.name,
    url: `${ORIGIN}/${locale}/services/${s.slug}`,
    provider: { '@id': ORGANIZATION_ID },
    areaServed: ['DE', 'AT', 'CH', 'EU'],
    availableLanguage: ['de', 'en'],
    ...(s.monthlyFrom
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: s.monthlyFrom,
              priceCurrency: 'EUR',
              unitText: 'MONTH',
              minPrice: s.monthlyFrom,
              description: 'Guide price; the final price is an individual quote.',
            },
            availability: 'https://schema.org/InStock',
            url: `${ORIGIN}/${locale}/quote`,
          },
        }
      : {}),
  }));

/** OfferCatalog hung off the Organization so the services are discoverable from it. */
export const offerCatalog = () => ({
  '@type': 'OfferCatalog',
  name: 'Managed Sovereign Infrastructure',
  itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@id': serviceId(s.slug) } })),
});
