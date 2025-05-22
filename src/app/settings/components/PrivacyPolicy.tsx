'use client';

import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-200 dark:bg-dark-grey rounded-lg p-6 overflow-y-auto">
      <h1 className="text-4xl font-semibold text-gray-700 dark:text-white mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Introduction</h2>
          <p className="mb-4">
            At Chamo Chat, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our chat application.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Collection of Your Information</h2>
          <p className="mb-4">
            We may collect information about you in a variety of ways. The information we may collect via the Application includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and profile information that you voluntarily give to us when you register with the Application.</li>
            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, browser type, operating system, access times, and the pages you have viewed.</li>
            <li><strong>Mobile Device Data:</strong> Device information, such as your mobile device ID, model, and manufacturer, and information about the location of your device, if you access the Application from a mobile device.</li>
            <li><strong>Chat Data:</strong> Messages, media, and other content you share through our platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Use of Your Information</h2>
          <p className="mb-4">
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create and manage your account.</li>
            <li>Deliver targeted advertising, newsletters, and other information regarding promotions to you.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable user-to-user communications.</li>
            <li>Generate a personal profile about you to make future visits to the Application more personalized.</li>
            <li>Increase the efficiency and operation of the Application.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
            <li>Notify you of updates to the Application.</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            <li>Process payments and refunds.</li>
            <li>Request feedback and contact you about your use of the Application.</li>
            <li>Resolve disputes and troubleshoot problems.</li>
            <li>Respond to product and customer service requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Disclosure of Your Information</h2>
          <p className="mb-4">
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
            <li><strong>Marketing Communications:</strong> With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes.</li>
            <li><strong>Interactions with Other Users:</strong> If you interact with other users of the Application, those users may see your name, profile photo, and descriptions of your activity.</li>
            <li><strong>Online Postings:</strong> When you post comments, contributions or other content to the Application, your posts may be viewed by all users and may be publicly distributed outside the Application in perpetuity.</li>
            <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Security of Your Information</h2>
          <p className="mb-4">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2 font-medium">
            Chamo Chat<br />
            Email: privacy@chamochat.com<br />
            Phone: (555) 123-4567
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
