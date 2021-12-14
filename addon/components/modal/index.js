import Component from '@glimmer/component';
import { action } from '@ember/object';
import onTransitionEnd from 'ember-transition-end/utils/on-transition-end';
import { hasTransitions } from 'ember-modal-service/utils/css-transitions';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import { buildWaiter } from '@ember/test-waiters';

const openWaiter = buildWaiter('ember-modal-service:open-waiter');
const closeWaiter = buildWaiter('ember-modal-service:close-waiter');

const isNotDestroyed = (target, key, descriptor) => {
  const targetMethod = descriptor.value;

  descriptor.value = function (...args) {
    // istanbul ignore if: lifecycle check.
    if (this.isDestroyed) {
      return;
    }

    return targetMethod.apply(this, args);
  };

  return descriptor;
};

export default class ModalComponent extends Component {
  @service modal;

  get element() {
    return this.args.element;
  }

  get model() {
    return this.args.model;
  }

  constructor() {
    super(...arguments);

    next(this, '_open');
  }

  @isNotDestroyed
  _safeDidOpen() {
    this.didOpen && this.didOpen();
  }

  @isNotDestroyed
  _open() {
    this.args.changeVisibility(true);

    if (hasTransitions(this.element)) {
      const token = openWaiter.beginAsync();
      const callback = () => {
        openWaiter.endAsync(token);
        this._safeDidOpen();
      };

      onTransitionEnd(this.element, callback, {
        transitionProperty: 'all',
        once: true,
        onlyTarget: true,
      });
    } else {
      this._safeDidOpen();
    }
  }

  @isNotDestroyed
  _close() {
    // Close modal.
    this.args.changeVisibility(false);

    // Remove modal from array when transition ends.
    if (hasTransitions(this.element)) {
      const token = closeWaiter.beginAsync();
      const callback = () => {
        closeWaiter.endAsync(token);
        this._remove();
      };

      onTransitionEnd(this.element, callback, {
        transitionProperty: 'all',
        once: true,
        onlyTarget: true,
      });
    } else {
      this._remove();
    }
  }

  @isNotDestroyed
  _remove() {
    this.modal._closeByModel(this.model);
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this._fullfillmentFn && this._fullfillmentFn();
  }

  @action
  resolve(data) {
    this._fullfillmentFn = () => this.model.resolve(data);
    this._close();
  }

  @action
  reject(error) {
    this._fullfillmentFn = () => this.model.reject(error);
    this._close();
  }
}
