export type RegulationStatus = 'legal' | 'restricted' | 'partial' | 'banned';

export interface OfficialLink {
  label: string;
  url: string;
}

export interface RegionRegulation {
  id: string;
  region: string;
  flag: string;
  status: RegulationStatus;
  summary: string;
  keyPoints: string[];
  taxTreatment: string;
  officialLinks: OfficialLink[];
  lastUpdated: string;
}

export const REGULATIONS: RegionRegulation[] = [
  {
    id: 'us',
    region: 'United States',
    flag: '🇺🇸',
    status: 'legal',
    summary: 'Cryptocurrency is legal in the US and regulated across multiple federal agencies. Bitcoin and Ether are classified as commodities by the CFTC, while many tokens may qualify as securities under SEC jurisdiction. The first spot Bitcoin ETFs were approved in January 2024.',
    keyPoints: [
      'Bitcoin and Ether classified as commodities by the CFTC',
      'SEC actively pursues enforcement against unregistered securities offerings',
      'Exchanges must register as Money Services Businesses (MSBs) with FinCEN',
      'Spot Bitcoin ETFs approved by the SEC in January 2024',
      'No unified federal crypto legislation enacted as of 2025',
      'State-level laws vary significantly (NY BitLicense vs Wyoming pro-crypto laws)',
    ],
    taxTreatment: 'The IRS treats crypto as property. Capital gains tax applies on every disposal (sale, trade, or spend). Short-term gains (held under 1 year) taxed as ordinary income up to 37%. Long-term gains taxed at 0%, 15%, or 20%. Staking and mining rewards taxed as income at receipt.',
    officialLinks: [
      { label: 'IRS Crypto Tax Guidance', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/virtual-currencies' },
      { label: 'SEC Digital Assets Hub', url: 'https://www.sec.gov/digital-assets' },
      { label: 'CFTC Virtual Currency', url: 'https://www.cftc.gov/digitalassets/index.htm' },
      { label: 'FinCEN Crypto Guidance', url: 'https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-persons-administering' },
    ],
    lastUpdated: '2025',
  },
  {
    id: 'eu',
    region: 'European Union',
    flag: '🇪🇺',
    status: 'legal',
    summary: 'The EU enacted the Markets in Crypto-Assets (MiCA) regulation, which came into full effect in December 2024. MiCA creates a unified licensing framework for crypto asset service providers across all 27 member states — the world\'s most comprehensive crypto regulation to date.',
    keyPoints: [
      'MiCA provides a single CASP license valid across all 27 EU member states',
      'Stablecoin issuers face strict reserve requirements and issuance limits',
      'Crypto Asset Service Providers must obtain authorization in their home member state',
      'The Travel Rule requires sender/receiver data on transfers over €1,000',
      'NFTs are largely excluded from MiCA scope (case-by-case assessment required)',
      'Markets can operate under a transitional period until mid-2026 in some states',
    ],
    taxTreatment: 'Tax treatment varies by member state. Germany exempts long-term holders (over 1 year) from capital gains tax entirely. France applies a flat 30% tax on crypto gains. Portugal, once crypto-friendly, introduced a 28% tax in 2023. Always check your specific country\'s rules.',
    officialLinks: [
      { label: 'MiCA Regulation Full Text', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1114' },
      { label: 'ESMA Crypto Guidelines', url: 'https://www.esma.europa.eu/press-news/esma-news/esma-publishes-guidelines-crypto-asset-service-providers' },
      { label: 'EBA Crypto Asset FAQs', url: 'https://www.eba.europa.eu/regulation-and-policy/anti-money-laundering-and-countering-financing-terrorism/crypto-assets' },
    ],
    lastUpdated: '2025',
  },
  {
    id: 'uk',
    region: 'United Kingdom',
    flag: '🇬🇧',
    status: 'legal',
    summary: 'The FCA regulates crypto in the UK under anti-money laundering rules. All UK crypto businesses must be registered. The UK government has signaled ambitions to become a global crypto hub, with broader legislation in development following Brexit.',
    keyPoints: [
      'FCA registration required for all crypto businesses operating in the UK',
      'Strict financial promotions rules — all crypto ads must include prominent risk warnings',
      'HMRC treats crypto as a capital asset, not currency',
      'Staking is regulated under collective investment scheme considerations',
      'Planned legislation to bring exchanges under full FCA authorisation',
      'The UK Travel Rule applies to crypto transfers over £1,000',
    ],
    taxTreatment: 'HMRC taxes crypto gains as Capital Gains Tax: 18% for basic rate taxpayers, 24% for higher rate (post-2024 changes). Income from staking, mining, and airdrops is taxed as income at your marginal rate. The annual CGT allowance is £3,000 (2024/25).',
    officialLinks: [
      { label: 'HMRC Crypto Tax Manual', url: 'https://www.gov.uk/government/publications/tax-on-cryptoassets' },
      { label: 'FCA Crypto Asset Register', url: 'https://register.fca.org.uk/s/search#t=Apps&sort=score+desc&f:@fcacategory=[Cryptoasset]' },
      { label: 'HM Treasury Crypto Regulation', url: 'https://www.gov.uk/government/publications/cryptoassets-taskforce' },
    ],
    lastUpdated: '2025',
  },
  {
    id: 'asia',
    region: 'Asia (Overview)',
    flag: '🌏',
    status: 'partial',
    summary: 'Asia has some of the most divergent approaches to crypto regulation in the world. Singapore and Japan have progressive licensing frameworks that attract global exchanges. China has imposed a near-total ban, while India, South Korea, and others sit somewhere in between.',
    keyPoints: [
      'Japan: FSA-regulated exchanges, Bitcoin recognized as legal payment method since 2017',
      'Singapore: MAS licensing under the Payment Services Act 2019, major global hub',
      'China: Trading and mining banned since 2021 — Hong Kong operates a separate progressive framework',
      'India: 30% flat tax on all crypto gains, 1% TDS on transactions — discourages active trading',
      'South Korea: Real-name account requirement at banks, exchange licensing mandatory',
      'Hong Kong: Licensed exchange regime since 2023, retail trading permitted for major assets',
    ],
    taxTreatment: 'Varies dramatically by country. Japan taxes gains as miscellaneous income, up to 55% for high earners. Singapore has no capital gains tax on crypto — gains are generally tax-free for individuals. India imposes 30% flat tax with no deductions allowed. South Korea plans a 20% crypto gains tax (repeatedly delayed).',
    officialLinks: [
      { label: 'MAS Singapore (Digital Payments)', url: 'https://www.mas.gov.sg/regulation/digital-payment-tokens' },
      { label: 'FSA Japan (Crypto Assets)', url: 'https://www.fsa.go.jp/en/crypto-assets/' },
      { label: 'SFC Hong Kong (Crypto)', url: 'https://www.sfc.hk/en/crypto-asset-and-virtual-asset-related-activities' },
    ],
    lastUpdated: '2025',
  },
  {
    id: 'global',
    region: 'Global Standards',
    flag: '🌐',
    status: 'partial',
    summary: 'International bodies including FATF, OECD, IMF, and BIS are developing global frameworks for crypto regulation. The FATF Travel Rule is the most widely adopted standard, requiring Virtual Asset Service Providers (VASPs) to share customer information on transactions.',
    keyPoints: [
      'FATF Travel Rule: VASPs must share sender/receiver information on transfers — adopted by 100+ countries',
      'OECD CARF: Crypto Asset Reporting Framework requires exchanges to report user data to tax authorities (effective 2027 in many countries)',
      'IMF actively monitors crypto\'s impact on monetary policy and financial stability',
      'BIS studying Central Bank Digital Currencies (CBDCs) as potential state-backed alternatives',
      'Over 60 countries have enacted some form of crypto-specific regulation as of 2025',
      'UN Office on Drugs and Crime tracks crypto use in illicit finance globally',
    ],
    taxTreatment: 'No global tax standard exists. The OECD\'s Crypto Asset Reporting Framework (CARF) will require exchanges in participating countries to automatically report user holdings and transactions to national tax authorities starting 2027 — similar to how banks report interest income. This will significantly increase tax enforcement globally.',
    officialLinks: [
      { label: 'FATF Virtual Assets Guidance', url: 'https://www.fatf-gafi.org/en/topics/virtual-assets.html' },
      { label: 'OECD Crypto Asset Reporting (CARF)', url: 'https://www.oecd.org/tax/exchange-of-tax-information/crypto-asset-reporting-framework-and-amendments-to-the-common-reporting-standard.htm' },
      { label: 'IMF Crypto Policy Resources', url: 'https://www.imf.org/en/Topics/fintech/crypto' },
    ],
    lastUpdated: '2025',
  },
];

export const STATUS_LABELS: Record<RegulationStatus, string> = {
  legal:      'Legal',
  restricted: 'Restricted',
  partial:    'Partial / Mixed',
  banned:     'Banned',
};

export const STATUS_COLORS: Record<RegulationStatus, string> = {
  legal:      '#00E676',
  restricted: '#FFB020',
  partial:    '#FFB020',
  banned:     '#FF3355',
};
