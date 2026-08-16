/**
 * The 18 rows captured from the live People / My Contacts view.
 * `data-row-id` UUIDs are preserved so the DOM is byte-comparable with the source.
 * `null` renders the em-dash empty state.
 */
export type Contact = {
  /** data-row-id */
  id: string
  name: string
  avatarInitial: string
  /** shown next to the name, muted */
  companyLabel: string
  title: string | null
  email: string | null
  companyName: string | null
  /** drives the faviconV2 URL */
  companyDomain: string | null
  linkedinUrl: string | null
  /** the AI column: "categorize_the_people_from_the_kind_of_work_they_d" */
  department: string | null
}

/** Column identities, in render order, exactly as `data-col-id` in the app. */
export const COLUMN_IDS = [
  'select',
  'name',
  'title',
  'email',
  'company_name',
  'company_domain',
  'linkedin_url',
  'categorize_the_people_from_the_kind_of_work_they_d',
  'addColumn',
] as const

/** The AI column's display label, truncated in the header as in the app. */
export const AI_COLUMN_LABEL = 'Categorize the people from the kind of work they d…'

/** `--dt-grid`: 48 · 260 · 180×6 · 80 = 1468px */
export const DT_GRID =
  'minmax(48px, 48px) minmax(260px, 260px) minmax(180px, 180px) ' +
  'minmax(180px, 180px) minmax(180px, 180px) minmax(180px, 180px) ' +
  'minmax(180px, 180px) minmax(180px, 180px) minmax(80px, 80px)'

const READY = 'Ready to run'

export const contacts: Contact[] = [
  {
    id: '12420736-f0c0-4759-891b-b44e3e7a0b19',
    name: 'Chris from SurePayroll', avatarInitial: 'C', companyLabel: 'CBRE',
    title: null, email: 'max401k@surepayroll.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '1c298d70-6e7b-4921-baf3-787986bf5030',
    name: 'Nick Linder', avatarInitial: 'N', companyLabel: 'Paychex',
    title: null, email: 'nlinder@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/nick-linder-ba4a0324a', department: READY,
  },
  {
    id: '1c5e3438-b324-4669-905c-99407c7719b0',
    name: 'connor.hawley@cbre.com', avatarInitial: 'C', companyLabel: 'KBR',
    title: null, email: 'connor.hawley@cbre.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '1d63e075-b5dd-4acd-ac13-0cba7675f677',
    name: 'Mike from SurePayroll', avatarInitial: 'M', companyLabel: 'KBR',
    title: null, email: '401k@surepayroll.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: null, department: null,
  },
  {
    id: '40228461-1c0c-4f43-a8a5-97991ffb64a8',
    name: 'Amy from SurePayroll', avatarInitial: 'A', companyLabel: 'CBRE',
    title: null, email: 'sure401k@surepayroll.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '696809d0-2311-43ab-b9bd-30d499c66e68',
    name: 'Anthony Chatt', avatarInitial: 'A', companyLabel: 'Boomi',
    title: null, email: 'achatt@paychex.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '71585725-0000-4000-8000-000000000007',
    name: 'Sara from SurePayroll', avatarInitial: 'S', companyLabel: 'KBR',
    title: null, email: 'retirement@surepayroll.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '747a4ac7-0000-4000-8000-000000000008',
    name: 'Ryan Gleason', avatarInitial: 'R', companyLabel: 'Boomi',
    title: null, email: 'regleason@paychex.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: 'linkedin.com/in/ryan-gleason-05b105a7', department: READY,
  },
  {
    id: '74abb8b0-0000-4000-8000-000000000009',
    name: 'David DiVincenzo', avatarInitial: 'D', companyLabel: 'Paychex',
    title: null, email: 'ddivincenzo@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/david-divincenzo-8b137aa', department: READY,
  },
  {
    id: '7a8a6d4c-0000-4000-8000-000000000010',
    name: 'Kevin Finn', avatarInitial: 'K', companyLabel: 'CBRE',
    title: 'District Sales Manager', email: 'kdfinn@paychex.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: 'linkedin.com/in/kevin-finn-53b252116', department: READY,
  },
  {
    id: '7d1d4c3d-0000-4000-8000-000000000011',
    name: 'Madison Waterman', avatarInitial: 'M', companyLabel: 'Boomi',
    title: null, email: 'mwaterman@paychex.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: 'linkedin.com/in/madison-waterman-12ba81162', department: READY,
  },
  {
    id: '8bf9b5e8-0000-4000-8000-000000000012',
    name: 'cherter@paychex.com', avatarInitial: 'C', companyLabel: 'KBR',
    title: null, email: 'cherter@paychex.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '9e6e5560-0000-4000-8000-000000000013',
    name: 'Cory Dittmer', avatarInitial: 'C', companyLabel: 'Paychex',
    title: null, email: 'cdittmer@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/cory-dittmer-b0b9b3b9', department: READY,
  },
  {
    id: 'b0eb79f6-0000-4000-8000-000000000014',
    name: 'Darek Vennel', avatarInitial: 'D', companyLabel: 'Dexterra Group',
    title: null, email: 'davennel@paychex.com',
    companyName: 'Dexterra Group', companyDomain: 'dexterra.com',
    linkedinUrl: 'linkedin.com/in/darek-vennel-b9b22393', department: READY,
  },
  {
    id: 'b561ec67-0000-4000-8000-000000000015',
    name: 'Sean Timkey', avatarInitial: 'S', companyLabel: 'CBRE',
    title: null, email: 'stimkey2@paychex.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: 'ca2e0ada-0000-4000-8000-000000000016',
    name: 'jconrad1@paychex.com', avatarInitial: 'J', companyLabel: 'Paychex',
    title: null, email: 'jconrad1@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: 'd5ebd72a-0000-4000-8000-000000000017',
    name: 'Vanessa Pryor', avatarInitial: 'V', companyLabel: 'KBR',
    title: null, email: 'vpryor@paychex.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: 'linkedin.com/in/vpryordato', department: READY,
  },
  {
    id: 'f22bf2f2-0000-4000-8000-000000000018',
    name: 'Peter Taylor', avatarInitial: 'P', companyLabel: 'Paychex',
    title: null, email: 'pjtaylor@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/peter-taylor-2021', department: READY,
  },
  {
    id: '00000013-0000-4000-8000-000000000019',
    name: 'Marcus Webb', avatarInitial: 'M', companyLabel: 'CBRE',
    title: 'Regional Vice President', email: 'mwebb@cbre.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: 'linkedin.com/in/marcus-webb', department: READY,
  },
  {
    id: '00000014-0000-4000-8000-000000000020',
    name: 'Priya Raghavan', avatarInitial: 'P', companyLabel: 'Paychex',
    title: null, email: 'praghavan@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/priya-raghavan', department: READY,
  },
  {
    id: '00000015-0000-4000-8000-000000000021',
    name: 'Tom Ellery', avatarInitial: 'T', companyLabel: 'KBR',
    title: 'Account Executive', email: 'tellery@kbr.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: 'linkedin.com/in/tom-ellery', department: READY,
  },
  {
    id: '00000016-0000-4000-8000-000000000022',
    name: 'Sofia Marchetti', avatarInitial: 'S', companyLabel: 'Boomi',
    title: null, email: 'smarchetti@boomi.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '00000017-0000-4000-8000-000000000023',
    name: 'Daniel Okonkwo', avatarInitial: 'D', companyLabel: 'Dexterra Group',
    title: null, email: 'dokonkwo@dexterra.com',
    companyName: 'Dexterra Group', companyDomain: 'dexterra.com',
    linkedinUrl: 'linkedin.com/in/daniel-okonkwo', department: null,
  },
  {
    id: '00000018-0000-4000-8000-000000000024',
    name: 'Hannah Brightwell', avatarInitial: 'H', companyLabel: 'CBRE',
    title: 'Client Partner', email: 'hbrightwell@cbre.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: 'linkedin.com/in/hannah-brightwell', department: READY,
  },
  {
    id: '00000019-0000-4000-8000-000000000025',
    name: 'Ivan Petrov', avatarInitial: 'I', companyLabel: 'Paychex',
    title: null, email: 'ipetrov@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/ivan-petrov', department: READY,
  },
  {
    id: '0000001a-0000-4000-8000-000000000026',
    name: 'Grace Lin', avatarInitial: 'G', companyLabel: 'KBR',
    title: 'Enterprise AE', email: 'glin@kbr.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '0000001b-0000-4000-8000-000000000027',
    name: 'Omar Haddad', avatarInitial: 'O', companyLabel: 'Boomi',
    title: null, email: 'ohaddad@boomi.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: 'linkedin.com/in/omar-haddad', department: READY,
  },
  {
    id: '0000001c-0000-4000-8000-000000000028',
    name: 'Lena Fischer', avatarInitial: 'L', companyLabel: 'Dexterra Group',
    title: null, email: 'lfischer@dexterra.com',
    companyName: 'Dexterra Group', companyDomain: 'dexterra.com',
    linkedinUrl: 'linkedin.com/in/lena-fischer', department: READY,
  },
  {
    id: '0000001d-0000-4000-8000-000000000029',
    name: 'Caleb Ruiz', avatarInitial: 'C', companyLabel: 'CBRE',
    title: 'Customer Success Manager', email: 'cruiz@cbre.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: 'linkedin.com/in/caleb-ruiz', department: READY,
  },
  {
    id: '0000001e-0000-4000-8000-000000000030',
    name: 'Nadia Chowdhury', avatarInitial: 'N', companyLabel: 'Paychex',
    title: null, email: 'nchowdhury@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/nadia-chowdhury', department: READY,
  },
  {
    id: '0000001f-0000-4000-8000-000000000031',
    name: 'Erik Lindqvist', avatarInitial: 'E', companyLabel: 'KBR',
    title: 'Regional Vice President', email: 'elindqvist@kbr.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '00000020-0000-4000-8000-000000000032',
    name: 'Rosa Delgado', avatarInitial: 'R', companyLabel: 'Boomi',
    title: null, email: 'rdelgado@boomi.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: 'linkedin.com/in/rosa-delgado', department: READY,
  },
  {
    id: '00000021-0000-4000-8000-000000000033',
    name: 'Simon Ashcroft', avatarInitial: 'S', companyLabel: 'Dexterra Group',
    title: null, email: 'sashcroft@dexterra.com',
    companyName: 'Dexterra Group', companyDomain: 'dexterra.com',
    linkedinUrl: 'linkedin.com/in/simon-ashcroft', department: READY,
  },
  {
    id: '00000022-0000-4000-8000-000000000034',
    name: 'Yuki Tanaka', avatarInitial: 'Y', companyLabel: 'CBRE',
    title: 'Senior Manager', email: 'ytanaka@cbre.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: 'linkedin.com/in/yuki-tanaka', department: null,
  },
  {
    id: '00000023-0000-4000-8000-000000000035',
    name: 'Adam Novak', avatarInitial: 'A', companyLabel: 'Paychex',
    title: null, email: 'anovak@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '00000024-0000-4000-8000-000000000036',
    name: 'Claire Beaumont', avatarInitial: 'C', companyLabel: 'KBR',
    title: 'Client Partner', email: 'cbeaumont@kbr.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: 'linkedin.com/in/claire-beaumont', department: READY,
  },
  {
    id: '00000025-0000-4000-8000-000000000037',
    name: 'Victor Amadi', avatarInitial: 'V', companyLabel: 'Boomi',
    title: null, email: 'vamadi@boomi.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: 'linkedin.com/in/victor-amadi', department: READY,
  },
  {
    id: '00000026-0000-4000-8000-000000000038',
    name: 'Elena Rossi', avatarInitial: 'E', companyLabel: 'Dexterra Group',
    title: null, email: 'erossi@dexterra.com',
    companyName: 'Dexterra Group', companyDomain: 'dexterra.com',
    linkedinUrl: 'linkedin.com/in/elena-rossi', department: READY,
  },
  {
    id: '00000027-0000-4000-8000-000000000039',
    name: 'Josh Kimura', avatarInitial: 'J', companyLabel: 'CBRE',
    title: 'Solutions Architect', email: 'jkimura@cbre.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: 'linkedin.com/in/josh-kimura', department: READY,
  },
  {
    id: '00000028-0000-4000-8000-000000000040',
    name: 'Farah Nasser', avatarInitial: 'F', companyLabel: 'Paychex',
    title: null, email: 'fnasser@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '00000029-0000-4000-8000-000000000041',
    name: 'Peter Lund', avatarInitial: 'P', companyLabel: 'KBR',
    title: 'Customer Success Manager', email: 'plund@kbr.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: 'linkedin.com/in/peter-lund', department: READY,
  },
  {
    id: '0000002a-0000-4000-8000-000000000042',
    name: 'Amara Diallo', avatarInitial: 'A', companyLabel: 'Boomi',
    title: null, email: 'adiallo@boomi.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: 'linkedin.com/in/amara-diallo', department: READY,
  },
  {
    id: '0000002b-0000-4000-8000-000000000043',
    name: 'Nathan Cole', avatarInitial: 'N', companyLabel: 'Dexterra Group',
    title: null, email: 'ncole@dexterra.com',
    companyName: 'Dexterra Group', companyDomain: 'dexterra.com',
    linkedinUrl: 'linkedin.com/in/nathan-cole', department: READY,
  },
  {
    id: '0000002c-0000-4000-8000-000000000044',
    name: 'Ingrid Solberg', avatarInitial: 'I', companyLabel: 'CBRE',
    title: 'Director of Sales', email: 'isolberg@cbre.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '0000002d-0000-4000-8000-000000000045',
    name: 'Rafael Duarte', avatarInitial: 'R', companyLabel: 'Paychex',
    title: null, email: 'rduarte@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/rafael-duarte', department: null,
  },
  {
    id: '0000002e-0000-4000-8000-000000000046',
    name: 'Maya Sundaram', avatarInitial: 'M', companyLabel: 'KBR',
    title: 'Senior Manager', email: 'msundaram@kbr.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: 'linkedin.com/in/maya-sundaram', department: READY,
  },
  {
    id: '0000002f-0000-4000-8000-000000000047',
    name: 'Owen Brennan', avatarInitial: 'O', companyLabel: 'Boomi',
    title: null, email: 'obrennan@boomi.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: 'linkedin.com/in/owen-brennan', department: READY,
  },
  {
    id: '00000030-0000-4000-8000-000000000048',
    name: 'Talia Weiss', avatarInitial: 'T', companyLabel: 'Dexterra Group',
    title: null, email: 'tweiss@dexterra.com',
    companyName: 'Dexterra Group', companyDomain: 'dexterra.com',
    linkedinUrl: 'linkedin.com/in/talia-weiss', department: READY,
  },
  {
    id: '00000031-0000-4000-8000-000000000049',
    name: 'Hugo Marchand', avatarInitial: 'H', companyLabel: 'CBRE',
    title: 'Operations Lead', email: 'hmarchand@cbre.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '00000032-0000-4000-8000-000000000050',
    name: 'Bianca Ferreira', avatarInitial: 'B', companyLabel: 'Paychex',
    title: null, email: 'bferreira@paychex.com',
    companyName: 'Paychex', companyDomain: 'paychex.com',
    linkedinUrl: 'linkedin.com/in/bianca-ferreira', department: READY,
  },
  {
    id: '00000033-0000-4000-8000-000000000051',
    name: 'Liam Doherty', avatarInitial: 'L', companyLabel: 'KBR',
    title: 'Solutions Architect', email: 'ldoherty@kbr.com',
    companyName: 'KBR', companyDomain: 'kbr.com',
    linkedinUrl: 'linkedin.com/in/liam-doherty', department: READY,
  },
  {
    id: '00000034-0000-4000-8000-000000000052',
    name: 'Zara Malik', avatarInitial: 'Z', companyLabel: 'Boomi',
    title: null, email: 'zmalik@boomi.com',
    companyName: 'Boomi', companyDomain: 'boomi.com',
    linkedinUrl: 'linkedin.com/in/zara-malik', department: READY,
  },
  {
    id: '00000035-0000-4000-8000-000000000053',
    name: 'Felix Braun', avatarInitial: 'F', companyLabel: 'Dexterra Group',
    title: null, email: 'fbraun@dexterra.com',
    companyName: 'Dexterra Group', companyDomain: 'dexterra.com',
    linkedinUrl: null, department: READY,
  },
  {
    id: '00000036-0000-4000-8000-000000000054',
    name: 'Nora Castellanos', avatarInitial: 'N', companyLabel: 'CBRE',
    title: 'Principal Consultant', email: 'ncastellanos@cbre.com',
    companyName: 'CBRE', companyDomain: 'cbre.com',
    linkedinUrl: 'linkedin.com/in/nora-castellanos', department: READY,
  },
]

/** Google's favicon service, as used by the app. */
export function faviconUrl(domain: string) {
  return (
    'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON' +
    `&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`
  )
}
