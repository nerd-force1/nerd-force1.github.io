/**
 * Leadership team. The `id` values are the canonical schema.org `@id`s already used for
 * these people on auto-intern.de, maxclerkwell.tech and edge-compute.skainet.io — one
 * identifier per person across the AI-Gruppe sites, never a second one minted here.
 * Display strings (role labels, blurbs) live in i18n under `team.members.<key>`.
 */
import { ORGANIZATION_ID } from './organization.data';
export { ORGANIZATION_ID };
export interface TeamMember {
  readonly key: 'odin' | 'stephan' | 'philipp' | 'dominic';
  readonly id: string;
  readonly name: string;
  readonly givenName: string;
  readonly familyName: string;
  /** Language-neutral title used in JSON-LD; the i18n role label is what is displayed. */
  readonly jobTitle: string;
  /** Registered Geschäftsführer per Impressum — shown alongside the CEO title. */
  readonly managingDirector?: boolean;
  readonly url: string;
  readonly links: ReadonlyArray<{ readonly label: string; readonly href: string }>;
}

export const TEAM: readonly TeamMember[] = [
  {
    key: 'odin',
    id: 'https://www.auto-intern.de/ueber-uns#odin-holmes',
    name: 'Odin Holmes',
    givenName: 'Odin',
    familyName: 'Holmes',
    jobTitle: 'Chief Strategy Officer',
    managingDirector: true,
    url: 'https://www.auto-intern.de/ueber-uns#odin-holmes',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/odinthenerd/' },
      { label: 'GitHub', href: 'https://github.com/odinthenerd' },
    ],
  },
  {
    key: 'stephan',
    id: 'https://maxclerkwell.tech/#person',
    name: 'Stephan Bökelmann',
    givenName: 'Stephan',
    familyName: 'Bökelmann',
    jobTitle: 'Chief Operating Officer',
    url: 'https://maxclerkwell.tech/',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/accelerator-stephan/' },
      { label: 'GitHub', href: 'https://github.com/MaxClerkwell' },
      { label: 'maxclerkwell.tech', href: 'https://maxclerkwell.tech/' },
    ],
  },
  {
    key: 'philipp',
    id: 'https://www.auto-intern.de/ueber-uns#philipp-lehmann',
    name: 'Philipp Lehmann',
    givenName: 'Philipp',
    familyName: 'Lehmann',
    jobTitle: 'Chief Technology Officer',
    url: 'https://www.auto-intern.de/ueber-uns#philipp-lehmann',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/philipp-lehmann-17995521b/' },
      { label: 'GitHub', href: 'https://github.com/philipptheserver' },
    ],
  },
  {
    key: 'dominic',
    id: 'https://dobe-1.dev/#person',
    name: 'Dominic Becker',
    givenName: 'Dominic',
    familyName: 'Becker',
    jobTitle: 'Security Engineer',
    url: 'https://dobe-1.dev/',
    links: [
      { label: 'dobe-1.dev', href: 'https://dobe-1.dev/' },
      { label: 'GitHub', href: 'https://github.com/dobe-1' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dominic-b-a2b721231' },
    ],
  },
];
