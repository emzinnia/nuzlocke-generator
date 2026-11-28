# [Nuzlocke Generator](https://nuzlocke-generator.com/) · ![GitHub release](https://img.shields.io/github/release/EmmaRamirez/nuzlocke-generator.svg?style=flat-square)

https://nuzlocke-generator.com/

## A Preview

![alt](./src/assets/media-seven.jpg)

## Features

- Track progress on your nuzlocke and share with others!
- Incredibly flexible templating system capable of custom CSS, custom Pokémon data, custom types, and more!
- Save data from your nuzlocke run as a `json` file
- Import data from your actual Gen I & Gen II save files!
- Manage multiple nuzlocke runs at once
- Drag and drop box management
- Record and track your run stats
- Spreadsheet mode for rapid editing
- Encounter tracking to ensure you don't miss a Pokémon

If you have ideas for features of fixes, please tell me! I want to make this app as useful as possible.

## Running Locally

In order to run this application locally, you'll need [NodeJS](https://nodejs.org/en/) and [Git](https://git-scm.com/). After installing those, start by opening the command prompt and running the following commands:

```bash
git clone git@github.com:EmmaRamirez/nuzlocke-generator.git
cd nuzlocke-generator
npm install
npm run serve
```

Node 20+ is recommended.

Note: closing the command prompt will stop the server!

You can also click the `Clone or Download` button and select to download it as a zip file. You'll then want to use the `cd` command to navigate to the nuzlocke-generator folder. I'm available through Github issues if you have any questions.

You should find it at `localhost:8080`. In order to check for updates, run the following

```bash
git pull origin master && npm install
```

And then re-run the server!

## Accessing Beta/In-Progress Features

> ⚠️ Proceed at your own risk! These features can be unstable and could possibly corrupt your data.

First, create a `.env` file at the root. The following are the current in-use environment variables:

```bash
# Determines if the build uses the faster production build or not
NODE_ENV=<'development' OR 'production'>
# Requires a Rollbar account, logs errors
ROLLBAR_ACCESS_TOKEN=<TOKEN>
ROLLBAR_ENDPOINT=https://api.rollbar.com/api/1/item/
# Used for Bug Reporter
GH_ACCESS_TOKEN=<GH_TOKEN>
# Used for future Theme Editor
THEME_EDITING=true
# Used for future Tem Tem support
TEM_TEM_SUPPORT=true
# Lists out new hotkeys
NEW_HOTKEYS=true
# Used for future HoF feature
HALL_OF_FAME=true
# Used for refactored Results view (still very unstable)
RESULT_V2=true
# Used for future data-freeze feature
LOCKS=true
# Used for planned Gen II saves support
GEN2_SAVES=true
# Used for image uploads
IMAGE_UPLOADS=true
# Legacy, tcg images are now enabled by default
TCG_IMAGES=true
# Required for cross-origin images (i.e. sprites mode)
CORS_ANYWHERE_URL=<URL>
```

## Enabling Sprites Mode in Local Instances

Unfortunately, [due to changes in cors-anywhere](https://github.com/Rob--W/cors-anywhere/issues/301), you will need to stand up your own instance of cors-anywhere in order to access cross-origin images (anything that comes from a non-nuzlocke-generator URL). After standing up your own server and whitelisting your localhost (you can run this locally as well), you can add `CORS_ANYWHERE_URL=<YOUR_URL>` to your `.env` file.

## Legal

I don't own Pokemon or any of the images except those of the app itself. All rights belong to their respective parties, including The Pokemon Company International and Nintendo. This application itself independent of copyrighted content is licensed under MIT.
