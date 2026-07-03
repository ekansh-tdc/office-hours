const sections = [
  {
    title: 'Using Office Hours',
    body: 'Office Hours helps you record office check-ins and check-outs, view your logs, filter them, and export them for your own records. You must provide accurate account information and use the service lawfully.'
  },
  {
    title: 'Your logs',
    body: 'You are responsible for the logs submitted through your account and API keys. Logs should reflect real check-in and check-out events. Do not submit misleading, abusive, or unlawful data.'
  },
  {
    title: 'API keys and automations',
    body: 'You may create API keys to connect personal device automations, such as arrival and departure routines. You are responsible for keeping API keys private and for all activity made with keys issued under your account.'
  },
  {
    title: 'Account security',
    body: 'You are responsible for maintaining access to your account and protecting your credentials. Notify us or rotate your keys if you suspect unauthorized use.'
  },
  {
    title: 'Acceptable use',
    body: 'Do not misuse the service, interfere with its operation, attempt unauthorized access, overload the service, or use it to violate someone else’s rights.'
  },
  {
    title: 'Availability',
    body: 'We aim to keep Office Hours reliable, but the service may change, pause, or become unavailable from time to time. We are not responsible for losses caused by downtime, incorrect logs, or user configuration errors.'
  },
  {
    title: 'Exports',
    body: 'CSV exports are provided for convenience. You are responsible for reviewing exported data before using it for payroll, compliance, reporting, or other business decisions.'
  },
  {
    title: 'Changes to these terms',
    body: 'We may update these Terms as the product evolves. Continued use of Office Hours after updates means you accept the revised Terms.'
  },
  {
    title: 'Contact',
    body: 'If you have questions about these Terms, contact the Office Hours team through the support channel provided in the app.'
  }
]

export default async function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          Last updated: July 3, 2026
        </p>
        <h1 className="text-4xl font-semibold tracking-normal">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-base leading-7">
          These Terms explain the basic rules for using Office Hours, including
          check-in logs, exports, account access, and API-key based automations.
        </p>
      </header>

      <div className="space-y-8">
        {sections.map(section => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-xl font-semibold tracking-normal">
              {section.title}
            </h2>
            <p className="text-muted-foreground leading-7">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
