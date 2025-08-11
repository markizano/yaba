# Yaba: Yet Another Budgeting App

Welcome to Yaba! Yet Another Budgeting App

This app does not try to re-invent the wheel. It merely tries to implement it in the most effective way.

Most budgeting apps try to act like a ledger and work with the "theory" of finance rather than the
practical effects of it.

This app is intended to curb my behaviours by giving me visibility and insights into my spending
habits rather than trying to make everything align perfectly.

One of the features this app brings is the ability to use mulitple tags to categorize transactions
instead of treating it like a bar you drop in a bucket and everything must fit together perfectly
like tetris.

In this way, I can see spend trends based on multiple factors instead of being perfect at math.

## Premise

I am tired of tracking my finances being across so many apps, platforms, logging into
many banks and other accounts to track my finances.

I am building this to be a data aggregator for all my finances. It will be manual at first
but I can always build it to be more automated once I get the structure of what I want laid out.

There are some problems I am facing when it comes to budgeting ... why not go with someone else?

- The market is shifting and changing all the time. You never know when your favorite budgeting
  app will be the next Mint.com.
- Banks go offline, get eaten by other banks or life events happen or you find another great offer
  you can't pass up.
- You're like me and want to control your own ledger and see where your accounts are sitting at
  based on the statements and documents you obtain from the bank itself.

This is an interface that will live as long as I do because I will support it through my
endeavors.

Core features include:

- Budgeting: Allows for custom tagging of transactions in a seamless fashion where changes are
  saved right there as you update the table.
- Charts and Graphs to help visualize your bugets and spend.
- Drag and Drop features where you can drag and drop your CSV files from your bank into the app
  for easy imports.
- Easy tracking of all your transactions across accounts.

The idea behind this app is you download your copy of the software, download the CSV files from
your banks, unplug the ethernet cable, and have a nice day budgeting!

There's no tracking software, no logins or passwords, no server to talk to, just you and your data
and it's open-source so you can inspect it yourself!

## How to Run

Releases will be available on the releases page. There you can download signed binaries I upload to
the project.

### From Source

    npm install && npm run start

Simple as that, you can run this from source.

This uses ElectronJS as the window interface and is an Angular application baked inside of it.

In this way, this app is accessible on any platform (Windows, Mac, Linux). However, this is not
a mobile-friendly operation. As such, screens require a desktop environment.

## Future Features

These are wishlist items I want to include after I get the first revision done:

- **Automated Account Sync**: I know there's API's that enable you to connect with your bank like Plaid
that enable you to automatically sync. It would be nice to not have to login to my bank every time I
wanted to see the latest updates on my finances.
- **Stock market tracking**: It would be great if you could also track your buys, sells and gains you
would pay in taxes on those transactions as well. Some kind of market interface would be great!
- Business Finance Tracking: Built-in software for business payroll calculations.
- **Taxes**: Calculations and Document generation for submitting to the IRS would be great if it doesn't
get too complicated by this part.
