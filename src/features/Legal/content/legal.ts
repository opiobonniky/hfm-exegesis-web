/**
 * Legal documents shown in the app.
 *
 * The copy lives here rather than in the translation bundles on purpose:
 * legal text is only authoritative in the language it was drafted in, so it is
 * not machine-translated. The surrounding UI (titles, buttons) is translated
 * through the normal i18n layer.
 */

export const LEGAL_LAST_UPDATED = '22 October 2026';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  id: 'terms' | 'privacy';
  sections: LegalSection[];
}

const CONTACT = 'the Support section of the app';

export const TERMS_OF_SERVICE: LegalDocument = {
  id: 'terms',
  sections: [
    {
      heading: '1. Acceptance of these Terms',
      paragraphs: [
        'These Terms of Service govern your use of the Exegesis application, website and related services (together, "Exegesis"). By creating an account, using a guest session, or otherwise accessing Exegesis, you agree to these Terms. If you do not agree, do not use the service.',
      ],
    },
    {
      heading: '2. Eligibility',
      paragraphs: [
        'You must be at least 13 years old to create an account. If you are under the age of majority where you live, you may use Exegesis only with the involvement of a parent or guardian.',
      ],
    },
    {
      heading: '3. Your account',
      paragraphs: [
        'You are responsible for the information you provide, for keeping your password confidential, and for all activity that happens under your account. Provide accurate details and tell us promptly if you believe your account has been compromised.',
        'You may delete your account at any time from Profile → Delete account. Deletion ends your access, cancels any active subscription, and erases personal data as described in the Privacy Policy. Billing records may be retained where the law requires it.',
      ],
    },
    {
      heading: '4. Subscriptions and payments',
      paragraphs: [
        'Some features require a paid subscription. Prices, billing periods and renewal terms are shown before you confirm a purchase. Payments are processed by our payment provider; we do not store your full card details.',
        'Subscriptions renew automatically until cancelled. You can cancel from the subscription screen or the store you purchased through. Cancellation stops future charges; it does not by itself refund amounts already billed, except where required by law or the applicable store policy.',
      ],
    },
    {
      heading: '5. Acceptable use',
      paragraphs: [
        'Exegesis is provided for personal study, reflection and ministry. You agree not to:',
      ],
      bullets: [
        'use the service for unlawful, abusive, harassing or fraudulent purposes;',
        'attempt to access another person’s account or data;',
        'interfere with, overload or attempt to bypass the security of the service;',
        'scrape, resell or redistribute content except as expressly permitted by its licence;',
        'upload malicious code or content that infringes someone else’s rights.',
      ],
    },
    {
      heading: '6. Your content',
      paragraphs: [
        'You retain ownership of the journals, notes, highlights, prayers and other content you create. You grant us a limited licence to store, process and display that content solely to operate the service for you.',
        'Content you choose to publish or share is your responsibility. Do not post content that is unlawful, hateful or that violates another person’s privacy.',
      ],
    },
    {
      heading: '7. Bible translations and licensing',
      paragraphs: [
        'Exegesis includes Bible translations that are in the public domain, released under free-copying licences, or used with permission. The translation picker shows the credit line and licence for each text. Where a licence requires attribution, you must keep that attribution when you quote or share the text.',
        'Translation availability may change when a licence is withdrawn or a text is replaced. Saved selections are migrated to the nearest available free text where possible.',
      ],
    },
    {
      heading: '8. Intellectual property',
      paragraphs: [
        'The Exegesis name, design, software and original study content are owned by us or our licensors and are protected by intellectual-property laws. These Terms do not grant you any right to use our branding without written permission.',
      ],
    },
    {
      heading: '9. Availability and disclaimers',
      paragraphs: [
        'We work to keep Exegesis available, but the service is provided "as is" and "as available". We do not promise uninterrupted or error-free operation. Bible study material is offered for general educational and devotional purposes and is not professional, legal, medical or financial advice.',
      ],
    },
    {
      heading: '10. Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, we are not liable for indirect, incidental, special or consequential damages, or for loss of data, profits or goodwill arising from your use of Exegesis. Nothing in these Terms limits rights that cannot be limited by law.',
      ],
    },
    {
      heading: '11. Suspension and termination',
      paragraphs: [
        'We may suspend or end access if you materially breach these Terms, if required by law, or to protect other users and the service. Where reasonable, we will give notice and an opportunity to resolve the issue.',
      ],
    },
    {
      heading: '12. Changes to these Terms',
      paragraphs: [
        'We may update these Terms as the service evolves. Material changes will be announced in the app before they take effect. Continuing to use Exegesis after the effective date means you accept the updated Terms.',
      ],
    },
    {
      heading: '13. Contact',
      paragraphs: [
        `Questions about these Terms can be sent through ${CONTACT}.`,
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  id: 'privacy',
  sections: [
    {
      heading: '1. Overview',
      paragraphs: [
        'This Privacy Policy explains what information Exegesis collects, why we collect it, and the choices you have. We collect the minimum needed to run a Bible study app: your account, your saved study content, and the technical data required to keep the service secure and reliable.',
      ],
    },
    {
      heading: '2. Information we collect',
      paragraphs: ['We collect the following categories of information:'],
      bullets: [
        'Account details: name, username, email address, phone number and password hash.',
        'Optional profile details: date of birth, gender, ministry interests and profile photo.',
        'Study content: journals, notes, highlights, favourites, reading-plan progress, quiz answers and search history.',
        'Subscription and billing status. Card details are handled by our payment provider, not stored by us.',
        'Device and usage data: app version, device type, language, and diagnostic logs used to fix errors.',
        'Notification data: push tokens and reminder preferences, when you enable notifications.',
      ],
    },
    {
      heading: '3. How we use information',
      paragraphs: ['We use your information to:'],
      bullets: [
        'create and secure your account and sign you in;',
        'save and sync your study content across sessions and devices;',
        'provide reading plans, reminders and the daily verse;',
        'process subscriptions and respond to support requests;',
        'detect abuse, prevent fraud and keep the service secure;',
        'understand aggregate usage so we can improve the app.',
      ],
    },
    {
      heading: '4. Legal bases',
      paragraphs: [
        'Where data-protection law requires a legal basis, we rely on: performance of our contract with you (running your account and the service); our legitimate interests (security, reliability and product improvement); your consent (optional notifications and optional profile fields); and legal obligation (tax and accounting records).',
      ],
    },
    {
      heading: '5. When we share information',
      paragraphs: [
        'We do not sell your personal information. We share it only with service providers that help us operate Exegesis, and only as needed:',
      ],
      bullets: [
        'cloud hosting and database providers;',
        'payment processing and subscription management;',
        'email delivery and push-notification providers;',
        'error monitoring and customer-support tools.',
      ],
    },
    {
      heading: '6. Payments',
      paragraphs: [
        'Paid subscriptions are processed by a third-party payment provider. That provider receives the information needed to charge you and manage your subscription, and handles card data under its own privacy policy. We receive subscription status and limited billing identifiers, not full card numbers.',
      ],
    },
    {
      heading: '7. Notifications and email',
      paragraphs: [
        'If you enable daily reminders, we store your chosen time and timezone and register a push token with our notification provider. You can turn reminders off at any time in Notification Settings. Service emails (verification, password reset, receipts) are sent even if marketing notifications are disabled.',
      ],
    },
    {
      heading: '8. Retention',
      paragraphs: [
        'We keep account and study data while your account is active. When you delete your account, we remove or anonymize personal data, cancel subscriptions and delete uploaded photos. We may retain limited billing and audit records where tax, accounting or fraud-prevention law requires it. Backups are overwritten on a rolling schedule.',
      ],
    },
    {
      heading: '9. Your rights',
      paragraphs: [
        'Depending on where you live, you may have the right to access, correct, export or delete your personal information, to object to or restrict certain processing, and to withdraw consent. You can exercise most of these directly in the app: edit your profile, download your journals, or delete your account from Profile → Delete account.',
        `For any other request, contact us through ${CONTACT}. We will respond within the period required by applicable law.`,
      ],
    },
    {
      heading: '10. Security',
      paragraphs: [
        'We use encryption in transit, hashed passwords, access controls and signed media links. No system is completely secure, so please use a strong, unique password and keep it private.',
      ],
    },
    {
      heading: '11. Children',
      paragraphs: [
        'Exegesis is not directed to children under 13, and we do not knowingly collect personal information from them. If you believe a child has created an account, contact us and we will delete it.',
      ],
    },
    {
      heading: '12. International transfers',
      paragraphs: [
        'Our service providers may process data in countries other than yours. Where required, we use contractual safeguards to protect the information during those transfers.',
      ],
    },
    {
      heading: '13. Changes to this Policy',
      paragraphs: [
        'We may update this Policy to reflect changes in the service or the law. Material changes will be announced in the app. The date at the top shows when the Policy was last revised.',
      ],
    },
    {
      heading: '14. Contact',
      paragraphs: [
        `Privacy questions and requests can be sent through ${CONTACT}.`,
      ],
    },
  ],
};
