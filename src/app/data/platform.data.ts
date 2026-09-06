export interface PlatformGroup { titleKey: string; tech: string[]; }

export const PLATFORM_GROUPS: PlatformGroup[] = [
  { titleKey: 'plattform.groups.identity', tech: ['HashiCorp Vault', 'Keycloak', 'NetBird', 'Traefik'] },
  { titleKey: 'plattform.groups.cluster',  tech: ['RKE2', 'Argo CD', 'Cilium', 'Ceph', 'cert-manager', 'Rancher'] },
  { titleKey: 'plattform.groups.security', tech: ['Wazuh', 'OpenCTI', 'Prometheus', 'Loki', 'Grafana'] },
  { titleKey: 'plattform.groups.apps',     tech: ['Nextcloud', 'Paperless-ngx', 'GitLab CE', 'Harbor', 'Vaultwarden'] },
];
