const sections = [
  {
    title: '1) Information We Collect',
    body: [
      'We may collect contact details, donation/payment records, volunteer/supporter profile details, communication preferences, and technical usage data such as IP address, browser type, and timestamps.',
    ],
  },
  {
    title: '2) How We Use Information',
    body: [
      'We use personal information to process donations and receipts, communicate updates, manage supporter and volunteer relationships, improve programs and website performance, and comply with legal obligations.',
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
      'We use reasonable safeguards including access controls, secure storage/transmission practices, and incident response procedures.',
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
      'When data is transferred across borders, we apply reasonable safeguards consistent with applicable law.',
    ],
  },
  {
    title: "10) Children's Privacy",
    body: [
      'Our services are not intended for unsupervised use by children where consent is legally required.',
    ],
  },
  {
    title: '11) Changes to This Notice',
    body: [
      'This notice may be updated. The revised date at the top indicates the latest version.',
    ],
  },
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

          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800">12) Contact Us</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              If you have questions about this Privacy Notice or our data practices, contact:
            </p>
            <div className="mt-3 text-sm leading-7 text-stone-700">
              <p>Lighthouse</p>
              <p>Email: [INSERT CONTACT EMAIL]</p>
              <p>Phone: [INSERT CONTACT PHONE]</p>
              <p>Address: [INSERT MAILING ADDRESS]</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
