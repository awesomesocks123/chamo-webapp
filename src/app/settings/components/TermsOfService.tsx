'use client';

import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-200 dark:bg-zinc-900 rounded-lg p-6 overflow-y-auto">
      <h1 className="text-4xl font-semibold text-gray-700 dark:text-white mb-8">Terms of Service</h1>
      
      <div className="space-y-8 text-gray-700 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using Chamo Chat, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">2. Description of Service</h2>
          <p className="mb-4">
            Chamo Chat is a messaging platform that allows users to connect with friends, join topic-based chat rooms, and engage in conversations. We provide this service to you subject to these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">3. User Accounts</h2>
          <div className="space-y-4 ml-2">
            <p>
              To use Chamo Chat, you must create an account with a valid email address. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account password</li>
              <li>Restricting access to your account</li>
              <li>All activities that occur under your account</li>
            </ul>
            <p>
              You must provide accurate and complete information when creating your account. You may not use false information or impersonate another person or entity.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">4. User Conduct</h2>
          <div className="space-y-4 ml-2">
            <p>
              You agree not to use Chamo Chat to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post, transmit, or share content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
              <li>Upload or transmit viruses or any other malicious code</li>
              <li>Interfere with or disrupt the service or servers or networks connected to the service</li>
              <li>Collect or store personal data about other users without their consent</li>
              <li>Promote or enable illegal activities</li>
              <li>Exploit or harm minors in any way</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">5. Content</h2>
          <div className="space-y-4 ml-2">
            <p>
              You are solely responsible for the content you post on Chamo Chat. By posting content, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You own or have the necessary licenses, rights, consents, and permissions to use and authorize us to use your content</li>
              <li>Your content does not infringe or violate the rights of any third party</li>
            </ul>
            <p>
              We reserve the right to remove any content that violates these terms or that we find objectionable for any reason.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">6. Privacy</h2>
          <p className="mb-4">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using Chamo Chat, you agree to our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">7. Termination</h2>
          <p className="mb-4">
            We reserve the right to terminate or suspend your account and access to Chamo Chat at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">8. Changes to Terms</h2>
          <p className="mb-4">
            We may modify these Terms of Service at any time. We will notify you of any changes by posting the new Terms of Service on this page. Your continued use of Chamo Chat after any such changes constitutes your acceptance of the new Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">9. Disclaimer of Warranties</h2>
          <p className="mb-4">
            Chamo Chat is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted or error-free, that defects will be corrected, or that the service or the server that makes it available are free of viruses or other harmful components.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">10. Contact</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us at terms@chamochat.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
