'use client';

import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-200 dark:bg-zinc-900 rounded-lg p-6 overflow-y-auto">
      <h1 className="text-4xl font-semibold text-gray-700 dark:text-white mb-8">Privacy Policy</h1>
      
      <div className="space-y-8 text-gray-700 dark:text-gray-200">
        <section id="overview">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This is our privacy policy which outlines what information we collect, why we collect it, and how we use it to give you the best experience on our app.
          </p>
        </section>

        <section id="collect">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">What We Collect</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We collect information, including info you choose to share with us and info while you're using our app.
          </p>
          
          <div className="space-y-4 ml-2">
            <div id="collect---info-shared">
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Info You Share</h3>
              <p className="mb-4">
                We collect the information that you share with us when creating an account. Account creation includes providing us with your first, last name, and email address.
                When you've created an account, you're able to customize your profile by adding a profile picture, biography, and custom tags.
                We record this information that you share with us, including your profile biography, any profile pictures uploaded, and any tags you've added to your profile.
              </p>
            </div>
            
            <div id="collect---info-app">
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Info When Using the App</h3>
              <p className="mb-4">
                We also collect information needed to use the app and its features. Chamo is primarily a messaging app, so of course, we collect and store information on the 
                chats you've joined, including the user who you've joined the chat with. When you create a new chat with a user, we collect information about that chat, 
                including the user you're paired with. We collect information about your interactions in the chatroom, including its messages and the timestamps of those 
                messages.
              </p>
              <p className="mb-4">
                When using Chamo's messaging feature, you have the ability to send friend requests to users you've chatted with. We collect information on the friends 
                you've added from the chats you created, as well as the list of your friends. We collect information about your browsing session, including the timestamp of 
                your current login session.
              </p>
            </div>
          </div>
        </section>

        <section id="use">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">How We Use It</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We collect information about you for many reasons, including maintaining the operability of the app, maintaining its safety and security, and communicating with you.
          </p>
          
          <div className="space-y-4 ml-2">
            <div id="use---operate">
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">To operate the app</h3>
              <p className="mb-4">
                We collect information in order to provide you with our services and allow you to use our app's features. For example, Chamo's messaging capability is one of its core features. For this feature to function, we collect and record messages and their timestamps so that you can chat with fellow users and read your chat history.
              </p>
            </div>
            
            <div id="use---safety">
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">To maintain safety and security</h3>
              <p className="mb-4">
                We also collect information to maintain the safety and security of your account and our app. For example, during the account creation process, ensuring the legitimacy of an email address is important! We collect your email address so that we can verify that the email entered is usable, which is important for managing your account as well as communicating with you!
              </p>
              <p className="mb-4">
                To ensure our users abide by our terms of service, we collect information about your messages to ensure it abides by our safety filter. 
                We collect information about your browsing session so that your sessions time out when you've been inactive for too long.
              </p>
            </div>
            
            <div id="use---communicate">
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">To communicate with you</h3>
              <p className="mb-4">
                We also use the email you provided us with to communicate with you regarding any help or customer service requests. This includes things like responding to any help requests or reports.
              </p>
            </div>
          </div>
        </section>

        <section id="disclose">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">How we disclose your information</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We don't disclose your information.
          </p>
          
          <div className="space-y-4 ml-2">
            <div id="disclose---does-not">
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Chamo doesn't.</h3>
              <p className="mb-4">
                Only our development team has access to your information strictly for development purposes. Chamo doesn't sell or disclose your information to third-parties.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">Contact Us</h2>
          <p className="mb-4">
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2 font-medium">
            Chamo Chat<br />
            Email: privacy@chamochat.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
