# ember-modal-service [![Build Status](https://travis-ci.org/BBVAEngineering/ember-modal-service.svg?branch=master)](https://travis-ci.org/BBVAEngineering/ember-modal-service) [![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-modal-service.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-modal-service) [![Dependency Status](https://david-dm.org/BBVAEngineering/ember-modal-service.svg)](https://david-dm.org/BBVAEngineering/ember-modal-service)

An [ember-cli addon](http://www.ember-cli.com/) to manage modals as promises.

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

## Contribute

If you want to contribute to this addon, please read the [CONTRIBUTING.md](CONTRIBUTING.md).
