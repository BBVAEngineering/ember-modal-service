import Component from '@ember/component';
import { camelize } from '@ember/string';
import { computed, action } from '@ember/object';
import onTransitionEnd from 'ember-transition-end/utils/on-transition-end';
import { hasTransitions } from 'ember-modal-service/utils/css-transitions';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { buildWaiter } from '@ember/test-waiters';

const openWaiter = buildWaiter('ember-modal-service:open-waiter');
const closeWaiter = buildWaiter('ember-modal-service:close-waiter');

export default class ModalComponent extends Component {
	@service modal;

	attributeBindings = ['data-modal-show', 'data-id'];

	ariaRole = 'dialog';

	@tracked visible = false;

	@computed('model.fullname')
	get 'data-id'() {
		return camelize(this.model.fullname);
	}

	@computed('visible')
	get 'data-modal-show'() {
		return String(this.visible);
	}

	init() {
		super.init(...arguments);

		next(this, '_open');
	}

	_safeDidOpen() {
		this.didOpen && this.didOpen();
	}

	_open() {
		// istanbul ignore if: lifecycle check.
		if (this.isDestroyed) {
			return;
		}

		const element = this.element;

		this.visible = true;

		if (hasTransitions(element)) {
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

	_close() {
		// istanbul ignore if: lifecycle check.
		if (this.isDestroyed || this.isDestroying) {
			return;
		}

		const element = this.element;

		// Close modal.
		this.visible = false;

		// Remove modal from array when transition ends.
		if (hasTransitions(element)) {
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

	_remove() {
		// istanbul ignore if: lifecycle check.
		if (this.isDestroyed) {
			return;
		}

		this.modal._closeByModel(this.model);
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

	willDestroy() {
		super.willDestroy(...arguments);

		this._fullfillmentFn && this._fullfillmentFn();
	}
}
