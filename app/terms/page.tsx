import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen theme-bg theme-text">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="glass-panel hairline mb-8 rounded-2xl px-6 py-5">
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300 hover:underline">← Back to Studio</Link>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white">Terms of Service</h1>
          <p className="mt-1 text-xs text-slate-400">Last updated: August 2026</p>
        </header>

        <div className="glass-panel hairline space-y-6 rounded-2xl px-6 py-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="mb-2 text-base font-bold text-white">1. Acceptance</h2>
            <p>
              By using AI Resume Builder ("the Service") you agree to these Terms. If you do not agree, please do not use
              the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">2. The Service</h2>
            <p>
              The Service provides AI-assisted resume and cover letter generation, ATS scoring, templates, and document
              exports. Documents are generated using a local AI engine; output should be reviewed before submission.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">3. Accounts &amp; License</h2>
            <p>
              The free tier includes standard templates and core features. PRO and PRO+ are one-time purchases that unlock
              premium features for lifetime access. Purchases are personal, non-transferable, and licensed to the purchasing
              individual only. Sharing or reselling your unlock is prohibited.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">4. Payments &amp; Refunds</h2>
            <p>
              Payments are processed by Creem (Merchant of Record), which handles taxes, receipts, and chargebacks. If a
              Service issue prevents you from using your purchase, contact us and we will work with Creem to resolve it.
              Please review Creem's policies for payment-related matters.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">5. Acceptable Use</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Do not use the Service for unlawful purposes, including fraud or misrepresentation.</li>
              <li>Do not attempt to bypass or tamper with paid feature access.</li>
              <li>Do not misrepresent AI-generated content as human-authored where prohibited by an employer or platform.</li>
              <li>You are responsible for the accuracy of the information you provide.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">6. No Guarantee</h2>
            <p>
              The Service helps you prepare documents but does not guarantee job placement, interviews, or any outcome.
              AI-generated content may contain errors; you are responsible for reviewing and finalizing your documents.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the Service is provided "as is" without warranties of any kind.
              We are not liable for indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-white">8. Changes &amp; Contact</h2>
            <p>
              We may update these Terms from time to time; continued use after changes constitutes acceptance.
              Questions: <a href="mailto:kaywebservice@gmail.com" className="text-blue-300 underline">kaywebservice@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}