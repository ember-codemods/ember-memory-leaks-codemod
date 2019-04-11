# ember-memory-leaks-codemod

[![Build Status](https://travis-ci.org/rajasegar/ember-memory-leaks-codemod.svg?branch=master)](https://travis-ci.org/rajasegar/ember-memory-leaks-codemod) 
[![Coverage Status](https://coveralls.io/repos/github/rajasegar/ember-memory-leaks-codemod/badge.svg?branch=master)](https://coveralls.io/github/rajasegar/ember-memory-leaks-codemod?branch=master)
[![npm version](http://img.shields.io/npm/v/ember-memory-leaks-codemod.svg?style=flat)](https://npmjs.org/package/ember-memory-leaks-codemod "View this project on npm")
[![dependencies Status](https://david-dm.org/rajasegar/ember-memory-leaks-codemod/status.svg)](https://david-dm.org/rajasegar/ember-memory-leaks-codemod)
[![devDependencies Status](https://david-dm.org/rajasegar/ember-memory-leaks-codemod/dev-status.svg)](https://david-dm.org/rajasegar/ember-memory-leaks-codemod?type=dev)

A collection of codemod's for fixing memory leaks in Ember applications.

Please refer [here](https://github.com/ember-best-practices/memory-leak-examples) to know more about memory leaks in Ember applications.

## Usage

To run a specific codemod from this project, you would run the following:

```
npx ember-memory-leaks-codemod <TRANSFORM NAME> path/of/files/ or/some**/*glob.js

# or

yarn global add ember-memory-leaks-codemod
ember-memory-leaks-codemod <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
```

## Transforms

### For fixing prototype reference leaks
```sh
npx ember-memory-leaks-codemod prototype-reference-leaks path/of/files/ or/some**/*glob.js
```

### For fixing callback leaks
```sh
npx ember-memory-leaks-codemod callback-leaks path/of/files/ or/some**/*glob.js
```

## Contributing

### Installation

* clone the repo
* change into the repo directory
* `yarn`

### Running tests

* `yarn test`

### Update Documentation

* `yarn update-docs`
