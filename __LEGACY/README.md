# periodicjs.ext.cronservice

An extension that adds Cron functionality to the application it is installed in

[API Documentation](https://github.com/typesettin/periodicjs.ext.cronservice/blob/master/doc/api.md)

## Usage


### Step 1: Installing the Extension

Install like any other extension, run `npm run install periodicjs.ext.cronservice` from your periodic application directory.

##Development
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

Then run grunt watch
```
$ grunt watch
```
For generating documentation
```
$ grunt doc
$ jsdoc2md controller/**/*.js index.js install.js uninstall.js > doc/api.md
```
##Notes
* Check out https://github.com/typesettin/periodicjs for the full Periodic Documentation