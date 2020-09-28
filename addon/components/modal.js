import Component from '@ember/component';
import { camelize } from '@ember/string';
import { computed } from '@ember/object';
import onTransitionEnd from 'ember-transition-end/utils/on-transition-end';
import { hasTransitions } from 'ember-modal-service/utils/css-transitions';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class ModalComponent extends Component.extend({
	// Needed to be able to reopen `resolve` and `reject` methods.
	actions: {
		resolve() {
			this.resolve(...arguments);
		},
		reject() {
			this.reject(...arguments);
		}
	}
}) {
	@service scheduler;

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

		// Prevent creating an uncaught promise.
		this.model.promise.catch(() => {}).finally(
			this._close.bind(this),
			`Component '${this.model.fullname}': close modal`
		);
	}

	didInsertElement() {
		super.didInsertElement(...arguments);

		run.next(this.scheduler, 'scheduleOnce', this, '_open');
	}

	didOpen() {}

	_safeDidOpen() {
		if (this.isDestroyed) {
			return;
		}

		this.didOpen();
	}

	_open() {
		// istanbul ignore if: lifecycle check.
		if (this.isDestroyed) {
			return;
		}

		const scheduler = this.scheduler;
		const element = this.element;

		this.visible = true;

		if (hasTransitions(element)) {
			onTransitionEnd(element, scheduler.scheduleOnce.bind(scheduler, this, '_safeDidOpen'), {
				transitionProperty: 'all',
				once: true,
				onlyTarget: true
			});
		} else {
			this.didOpen();
		}
	}

	_close() {
		// istanbul ignore if: lifecycle check.
		if (this.isDestroyed) {
			return;
		}

		const scheduler = this.scheduler;
		const element = this.element;

		// Close modal.
		this.visible = false;

		// Remove modal from array when transition ends.
		if (hasTransitions(element)) {
			onTransitionEnd(element, scheduler.scheduleOnce.bind(scheduler, this, '_remove'), {
				transitionProperty: 'all',
				once: true,
				onlyTarget: true
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

		this.modal.content.removeObject(this.model);
	}

	resolve(data, label = `Component '${this.model.fullname}': fulfillment`) {
		this.model.deferred.resolve(data, label);
	}

	reject(data, label = `Component '${this.model.fullname}': rejection`) {
		this.model.deferred.reject(data, label);
	}
}
