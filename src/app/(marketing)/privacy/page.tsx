const sections = [
  {
    title: 'Information we collect',
    body: 'We collect the information you provide when you create an account, such as your name and email address. We also store the check-in and check-out logs you submit, including the log type, timestamp, and optional tag.'
  },
  {
    title: 'How we use your information',
    body: 'We use your information to provide the service, show your attendance history, support filtering and CSV exports, manage your account, and keep the app secure.'
  },
  {
    title: 'Location information',
    body: 'Office Hours does not need to continuously track your location. If you use your phone automation to call our API when arriving or leaving, your device decides when to send that request. We store the resulting log, not a live location trail.'
  },
  {
    title: 'API keys',
    body: 'You can create API keys to submit logs from your own devices or automations. Keep your keys private. You may rotate or remove keys if you believe one has been exposed.'
  },
  {
    title: 'Sharing',
    body: 'We do not sell your personal information. We may share limited information only when needed to operate the service, comply with the law, or protect the service and its users.'
  },
  {
    title: 'Retention and deletion',
    body: 'We keep your account and log data while your account is active or as needed to provide the service. You may request deletion of your account and associated logs.'
  },
  {
    title: 'Security',
    body: 'We use reasonable safeguards to protect your data, but no online service can guarantee perfect security. You are responsible for protecting your account and API keys.'
  },
  {
    title: 'Contact',
    body: 'If you have questions about this Privacy Policy or your data, contact the Office Hours team through the support channel provided in the app.'
  }
]

export default async function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">
          Last updated: July 3, 2026
        </p>
        <h1 className="text-4xl font-semibold tracking-normal">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-base leading-7">
          This Privacy Policy explains how Office Hours handles information for
          account-based office check-in and check-out tracking.
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
