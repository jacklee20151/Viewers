# Build for Production

> If you've already followed the
> ["Getting Started" Guide](/essentials/getting-started.md), you can skip ahead
> to [Configuration](#configuration)

## Overview

### Build Machine Requirements

- [Node.js & NPM](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/lang/en/docs/install/)
- [Git](https://www.atlassian.com/git/tutorials/install-git)

### Getting the Code

_With Git:_

```bash
# Clone the remote repository to your local machine
git clone https://github.com/OHIF/Viewers.git

# Make sure the local code reflects the `react` version of the OHIF Viewer
git checkout react
```

More on: _[`git clone`](https://git-scm.com/docs/git-clone),
[`git checkout`](https://git-scm.com/docs/git-checkout)_

_From .zip:_

[OHIF/Viewers: react.zip](https://github.com/OHIF/Viewers/archive/react.zip)

### Restore Dependencies & Build

Open your terminal, and navigate to the directory containing the source files.
Next run these commands:

```js
// Restore dependencies
yarn install

// Build source code for production
yarn run build:web
```

If everything worked as expected, you should have a new `build/` directory in
the project's folder. It should roughly resemble the following:

```bash
build
├── config/
├── static/
├── index.html
├── manifest.json
├── service-worker.js
└── ...
```

By default, the build output will connect to OHIF's publicly accessible PACS. If
this is your first time setting up the OHIF Viewer, it is recommended that you
test with these default settings. After testing, you can find instructions on
how to configure the project for your own imaging archive below.

### Configuration

> This step assumes you have an imaging archive. If you need assistance setting
> one up, check out the [`Data` section](./../index.md#data) of our Deployment
> Guide, or `Getting Started`'s
> ["Set up a local DICOM server"](./../../essentials/getting-started.md#set-up-a-local-dicom-server),
> or a deployment recipe that contains an open source Image Archive

#### How it Works

The configuration for our project is in the `/public/config` directory. Our
build process knows which configuration file to use based on the
`REACT_APP_CONFIG` environment variable. By default, its value is
[`default.js`](https://github.com/OHIF/Viewers/blob/react/public/config/default.js).
When we build, the `%REACT_APP_CONFIG%` value in
our[`/public/index.html`](https://github.com/OHIF/Viewers/blob/react/public/index.html#L12-L15)
file is substituted for the correct configuration file's name. This sets
the`window.config` equal to our configuration file's value.

#### How do I configure my project?

- Modify its values directly
- Create a new config file, and set the `REACT_APP_CONFIG` environement variable
-

The build process knows which file to use based on the `REACT_APP_CONFIG`
environment variable. You can set the value of this environment variable a few
different ways:

- [Add a temporary environment variable in your shell](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#adding-temporary-environment-variables-in-your-shell)
- [Add environment specific variables in `.env` file(s)](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#adding-development-environment-variables-in-env)
-

* env vars
* `REACT_APP_*`
* config file(s)

## Next Steps

### Deploying our Production Build

TODO: List of recipes

### Testing Build Output Locally

A quick way to test your build output locally is to spin up a small webserver.
You can do this by running the following commands in the `build/` output
directory:

```js
// Install http-server as a globally available package
yarn global add http-server

// Serve the files in our current directory
// Accessible at: `http://localhost:8080`
http-server
```

### Automating Builds and Deployments

If you found setting up your environmnent and running all of these steps to be a
bit tedious, then you are in good company. Thankfully, there are a large number
of tools available to assist with automating tasks like building and deploying
web application. For a starting point, check out this repository's own use of:

- [CircleCI][circleci]: [config.yaml][circleci-config]
- [Netlify][netlify]: [netlify.toml][netlify.toml] |
  [generateStaticSite.sh][generatestaticsite.sh]
- [Semantic-Release][semantic-release]: [.releaserc][releaserc]

## Troubleshooting

> Issues and resolutions for common GitHub issues will be summarized here

...

<!-- prettier-ignore-start -->
[circleci]: https://circleci.com/gh/OHIF/Viewers
[circleci-config]: https://github.com/OHIF/Viewers/blob/react/.circleci/config.yml
[netlify]: https://app.netlify.com/sites/ohif/deploys
[netlify.toml]: https://github.com/OHIF/Viewers/blob/react/netlify.toml
[generateStaticSite.sh]: https://github.com/OHIF/Viewers/blob/react/generateStaticSite.sh
[semantic-release]: https://semantic-release.gitbook.io/semantic-release/
[releaserc]: https://github.com/OHIF/Viewers/blob/react/.releaserc
<!-- prettier-ignore-end -->