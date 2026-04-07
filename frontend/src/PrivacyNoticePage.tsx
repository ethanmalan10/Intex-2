const sections = [
  {
    title: '1) Information We Collect',
    body: [
      'We may collect contact details, donation/payment records, volunteer/supporter profile details, communication preferences, and technical usage data such as IP address, browser type, and timestamps.',
      'We may use aggregated and anonymized data to demonstrate how donations contribute to program outcomes without identifying individuals.',
    ],
  },
  {
    title: '2) How We Use Information',
    body: [
      'We use personal information to process donations and receipts, communicate updates, manage supporter and volunteer relationships, improve programs and website performance, and comply with legal obligations.',
      'We collect only the minimum amount of personal data necessary to fulfill the purposes described.',
    ],
  },
  {
    title: '3) Legal Basis (Where Applicable)',
    body: [
      'Depending on jurisdiction, processing may rely on consent, performance of a requested service, legal obligations, or legitimate organizational interests.',
    ],
  },
  {
    title: '4) Sharing of Information',
    body: [
      'We do not sell personal information. We may share information with trusted processors (such as payment or email providers), professional advisors, or authorities when required by law.',
    ],
  },
  {
    title: '5) Data Retention',
    body: [
      'Data is retained only for as long as needed for donor operations, legal/tax/audit requirements, and legitimate program needs. Data is then deleted, anonymized, or securely archived.',
    ],
  },
  {
    title: '6) Data Security',
    body: [
      'We implement administrative, technical, and physical safeguards including encryption in transit (HTTPS/TLS), encryption at rest for sensitive data, role-based access controls, least-privilege access, and secure authentication practices.',
      'We maintain monitoring, logging, and incident response procedures to detect and respond to unauthorized access or misuse.',
      'In the event of a data breach, we will take appropriate steps to contain, investigate, and notify affected individuals and authorities as required by applicable law.',
    ],
  },
  {
    title: '7) Your Rights',
    body: [
      'Depending on your location, you may have rights to access, correct, delete, restrict, or object to processing, and to withdraw consent where applicable.',
    ],
  },
  {
    title: '8) Cookies and Tracking',
    body: [
      'Essential cookies are always used for core functionality. Non-essential analytics cookies are only used after consent through the cookie banner/settings controls.',
    ],
  },
  {
    title: '9) International Transfers',
    body: [
      'When personal data is transferred across borders, we apply appropriate safeguards such as contractual protections, secure transfer mechanisms, and compliance with applicable laws including LGPD and other international data protection requirements.',
    ],
  },
  {
    title: "10) Children's Privacy",
    body: [
      'Our public website is not intended for direct use by children where consent is legally required.',
      'While our organization serves minors in a safeguarding context, we do not collect personal data from children through the public website.',
      'Any data related to minors is collected and processed only through secure internal systems under strict legal, ethical, and safeguarding controls.',
    ],
  },
  {
    title: '11) Changes to This Notice',
    body: [
      'This notice may be updated. The revised date at the top indicates the latest version.',
    ],
  },
  {
    title: '12) Jurisdiction-Specific Rights (U.S. and Brazil)',
    body: [
      'For users in Brazil, personal data is processed in accordance with the Lei Geral de Proteção de Dados (LGPD). You may have rights to confirmation of processing, access, correction, anonymization, blocking, deletion, and information about data sharing.',
      'For users in the United States, including California residents under the California Consumer Privacy Act (CCPA/CPRA), you may have rights to access, delete, and correct personal data, and to opt out of certain data uses where applicable.',
    ],
  },
  {
    title: '13) Sensitive Data and Safeguarding',
    body: [
      'Due to the nature of our mission, we may process highly sensitive information related to vulnerable individuals through secure internal systems.',
      'Such data is encrypted at rest and in transit and is strictly limited to authorized personnel under role-based access controls and confidentiality obligations.',
      'Sensitive data is never publicly displayed in identifiable form and is only used for legitimate safeguarding, case management, and protection purposes.',
    ],
  }
]

export default function PrivacyNoticePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <section className="bg-gradient-to-br from-teal-900 to-stone-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-5xl">
          <a href="/" className="inline-block text-sm text-teal-200 hover:text-white">
            {'<- Back to Home'}
          </a>
          <h1 className="mt-5 text-4xl font-bold">Privacy Notice</h1>
          <p className="mt-3 max-w-3xl text-sm text-white/80">
            Last updated: April 7, 2026. This page explains how Lighthouse collects, uses, stores, and protects
            personal information across website, donation, and support workflows.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-800">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-7 text-stone-600">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
