import PublicLayout from './components/layout/PublicLayout'

export default function DonorsContributionsPage() {
  return (
    <PublicLayout navVariant="default" offsetTop={true}>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <section className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="text-3xl font-bold text-stone-900">Donors &amp; Contributions</h1>
          <p className="mt-3 text-stone-600">
            This page is currently in progress. It will provide donor records, contribution history,
            and management workflows for admin users.
          </p>
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-600">
              Placeholder route is active so navigation and role controls are ready while the full page is built.
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
