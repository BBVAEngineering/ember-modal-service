import Component from '@ember/component';
import { camelize } from '@ember/string';
import { action } from '@ember/object';
import onTransitionEnd from 'ember-transition-end/utils/on-transition-end';
import { hasTransitions } from 'ember-modal-service/utils/css-transitions';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

// Migrate to Glimmer when possible
// https://github.com/emberjs/rfcs/issues/497
export default class ModalComponent extends Component {
	@service scheduler;
	@service modal;

	attributeBindings = ['data-modal-show', 'data-id'];

	ariaRole = 'dialog';

	@tracked visible = false;

	get 'data-id'() {
		return camelize(this.model.fullname);
	}

	get 'data-modal-show'() {
		return String(this.visible);
	}

	init() {
		super.init(...arguments);

		// Prevent creating an uncaught promise.
		this.model.promise
			.catch(() => {})
			.finally(
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
			onTransitionEnd(
				element,
				scheduler.scheduleOnce.bind(scheduler, this, '_safeDidOpen'),
				{
					transitionProperty: 'all',
					once: true,
					onlyTarget: true,
				}
			);
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
			onTransitionEnd(
				element,
				scheduler.scheduleOnce.bind(scheduler, this, '_remove'),
				{
					transitionProperty: 'all',
					once: true,
					onlyTarget: true,
				}
			);
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

	willDestroy() {
		super.willDestroy(...arguments);

		this.modal.trigger('will-destroy', this.model);
	}

	@action
	resolve(data) {
		this.model.resolve(data);
	}

	@action
	reject(err) {
		this.model.reject(err);
	}
}
