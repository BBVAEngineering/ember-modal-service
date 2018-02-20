# ember-modal-service

[![Build Status](https://travis-ci.org/BBVAEngineering/ember-modal-service.svg?branch=master)](https://travis-ci.org/BBVAEngineering/ember-modal-service) 
[![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-modal-service.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-modal-service) 
[![npm version](https://badge.fury.io/js/ember-modal-service.svg)](https://badge.fury.io/js/ember-modal-service)
[![Dependency Status](https://david-dm.org/BBVAEngineering/ember-modal-service.svg)](https://david-dm.org/BBVAEngineering/ember-modal-service)

An [ember-cli addon](http://www.ember-cli.com/) to manage modals as promises.

## Information

[![NPM](https://nodei.co/npm/ember-modal-service.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ember-modal-service/)

## Install in ember-cli application

In your application's directory:

    ember install ember-modal-service

## Usage

```javascript
// Inject the service
modal: Ember.inject.service(),

...

// To open a modal use the method `open` with the modal name and the options for the modal.
this.get('modal').open('foo', { bar: 'bar' });

// The returning value of the modal is a promise that is resolved or rejected when the modal is closed.
this.get('modal').open('foo').then(() => {
    // modal closed
});
```

```javascript
// In order to register a new modal, you need to register the modal object in the application container.
// app/components/modal-foo.js
import ModalComponent from 'ember-modal-service/components/modal';
export default ModalComponent.extend();
```

All the modals are shown in the modal container.

```html
{{! templates/application.hbs }}
{{modal-container}}
```

You can close all modals by using the `close` method.

```javascript
this.get('modal').close();
```

Or just some of them.

```javascript
this.get('modal').close((modal) => {
  return modal.name === 'foo';
});

this.get('modal').close('name', 'foo');
```

Base modal component provides `resolve` & `reject` actions so you can implement basic closing behaviour directly on the template. You can pass any arguments you want the modal to be resolved / rejected with

```html
<button {{action "reject" "foo" "bar"}}>Close modal</button>
```

## Contribute

If you want to contribute to this addon, please read the [CONTRIBUTING.md](CONTRIBUTING.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/BBVAEngineering/ember-modal-service/tags).


## Authors

See the list of [contributors](https://github.com/BBVAEngineering/ember-modal-service/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
