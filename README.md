# ember-modal-service

[![Build Status](https://travis-ci.org/BBVAEngineering/ember-modal-service.svg?branch=master)](https://travis-ci.org/BBVAEngineering/ember-modal-service)
[![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-modal-service.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-modal-service)
[![NPM version](https://badge.fury.io/js/ember-modal-service.svg)](https://badge.fury.io/js/ember-modal-service)
[![Dependency Status](https://david-dm.org/BBVAEngineering/ember-modal-service.svg)](https://david-dm.org/BBVAEngineering/ember-modal-service)
[![codecov](https://codecov.io/gh/BBVAEngineering/ember-modal-service/branch/master/graph/badge.svg)](https://codecov.io/gh/BBVAEngineering/ember-modal-service)
[![Greenkeeper badge](https://badges.greenkeeper.io/BBVAEngineering/ember-modal-service.svg)](https://greenkeeper.io/)
[![Ember Observer Score](https://emberobserver.com/badges/ember-modal-service.svg)](https://emberobserver.com/addons/ember-modal-service)

An [ember-cli addon](http://www.ember-cli.com/) to manage modals as promises.

## Information

[![NPM](https://nodei.co/npm/ember-modal-service.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ember-modal-service/)

## Install in ember-cli application

In your application's directory:

```bash
ember install ember-modal-service
```

## Usage

### Register the modal container

All the modals are shown inside the modal container once opened.

```html
{{! templates/application.hbs }}
<ModalContainer />
```

### Create a modal component

In order to register a new modal, you need to register the modal object in the application container using the preffix `modal-*`.

```javascript
// app/components/modal-foo.js
import ModalComponent from 'ember-modal-service/components/modal';

export default class FooModal extends ModalComponent {
   data = this.model.options.data; 
}
```

```html
{{! app/templates/modal-foo.hbs }}

<div>
  <p>{{data}}</p>
</div>
```

### Opening the modal

```javascript
import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class Controller extends Controller {
  // Inject the service
  @service modal;

  @action
  async doSomething() {
    // To open a modal use the method `open` with the modal name and the options for the modal.
    try {
      const result = await this.modal.open('foo', { bar: 'bar' });

      // Modal have been resolved
    } catch(e) {
      // Modal have been rejected
    }
  }
```

### Other useful things

You can close all modals by using the `close` method.

```javascript
this.modal.close();
```

Or just some of them.

```javascript
this.modal.close((modal) => {
  return modal.name === 'foo';
});

this.modal.close('name', 'foo');
```

Base modal component provides `resolve` & `reject` actions so you can implement basic closing behaviour directly on the template. You can pass any arguments you want the modal to be resolved / rejected with

```html
<button {{fn this.reject "foo" "bar"}}>Resolve modal with two args</button>

<button {{fn this.reject "foo" "bar"}}>Reject modal with two args</button>
```

## Contribute

If you want to contribute to this addon, please read the [CONTRIBUTING.md](CONTRIBUTING.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/BBVAEngineering/ember-modal-service/tags).


## Authors

See the list of [contributors](https://github.com/BBVAEngineering/ember-modal-service/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
