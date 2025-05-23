'use client';

import React from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "How do I create an account on the chat app?",
      answer: "To create an account, simply download the app from the app store, open it, and follow the on-screen instructions to sign up. You'll need to provide a valid email address or phone number and create a secure password."
    },
    {
      question: "Can I use the chat app on multiple devices simultaneously?",
      answer: "Yes, the chat app supports multi-device functionality. Once logged in, you can access your chats and conversations seamlessly across different devices, such as smartphones, tablets, and computers."
    },
    {
      question: "Is end-to-end encryption supported for private conversations?",
      answer: "Absolutely. Your private conversations are protected with end-to-end encryption, ensuring that only you and the intended recipient can access the messages. This enhances the security and privacy of your communications."
    },
    {
      question: "How do I customize my profile on the chat app?",
      answer: "To customize your profile, go to the settings menu and select the 'Profile' option. Here, you can upload a profile picture, update your status, and add a personal bio. Make your profile uniquely yours!"
    },
    {
      question: "What should I do if I forget my password?",
      answer: "If you forget your password, simply click on the 'Forgot Password' link on the login screen. Follow the prompts to reset your password via email or SMS. Ensure your account remains secure by choosing a strong, unique password."
    }
  ];

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-zinc-900 rounded-lg p-6">
      <h1 className="text-4xl font-semibold text-gray-700 dark:text-white mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{faq.question}</h3>
            <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
