This displays Vocabulary inside the vocab.json in your AltspaceVR world.
You can add 3D-Models for these vocabulary items.
A word is displayed above the 3D-Model. You can switch between the original Word, a translation and the phonetics.
There also is a button, that when pressed, plays a sound file (pronunciation).
[Example](public/example_picture.png)

## Setup

* Open a command prompt to this sample's folder and run `npm install`. Keep the command prompt open if you wish to follow the command-oriented instructions that follow.

## Build

* Command line: `npm run build`.

## Run

* Command line: `npm start`.
* Command line: `npm run debug-watch` if you want to change the code and see your changes immediately

MRE apps are NodeJS servers. They operate akin to a web server. When you start your MRE, it won't do much until you connect to it from a client application like AltspaceVR or the MRETestBed.

## Test in [AltspaceVR](https://altvr.com)

* Download [AltspaceVR](https://altvr.com) and create an account.
* Launch the application and sign in. You'll start in your "home space".
* Open the World Editor (only available if you indicate you want to participate in the [Early Access Program](https://altvr.com/early-access-program/) in your AltspaceVR settings).
* Add a `Basics` / `SDK App` object with a Target URI of `ws://localhost:3901`.
* See the the app appear in your space.

## Attribution

See licenses.md
