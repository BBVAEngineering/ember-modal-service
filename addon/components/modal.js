/* eslint-disable quote-props, no-magic-numbers */
import Component from '@ember/component';
import RSVP from 'rsvp';
import { camelize } from '@ember/string';
import { computed } from '@ember/object';
import { hasTransitions, onTransitionEnd } from 'ember-modal-service/utils/css-transitions';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { run } from '@ember/runloop';

/**
 * Component to wrap modal objects.
 *
 * @extends Ember.Component
 */
export default Component.extend({

	/**
	 * Modal service inject.
	 *
	 * @property modal
	 * @type Object
	 */
	scheduler: service('scheduler'),

	/**
	 * Modal service inject.
	 *
	 * @property modal
	 * @type Object
	 */
	modal: service('modal'),

	/**
	 * HTML class name bindings.
	 *
	 * @property classNameBindings
	 * @type Array
	 */
	classNameBindings: ['model.options.hasOverlay:modal-overlay:modal-view'],

	/**
	 * HTML attributes bindings.
	 *
	 * @property attributeBindings
	 * @type Array
	 */
	attributeBindings: ['data-modal-show', 'data-id'],

	/**
	 * HTML role.
	 *
	 * @property ariaRole
	 * @type String
	 */
	ariaRole: 'dialog',

	/**
	 * Modal is visible/hidden.
	 *
	 * @property visible
	 * @type Boolean
	 */
	visible: false,

	/**
	 * `data-id` attribute of wrapper element
	 *
	 * @property data-id
	 * @type {String}
	 */
	'data-id': computed('model.fullname', function() {
		return camelize(this.get('model.fullname'));
	}),

	/**
	 * Modal is visible/hidden. This property is read from CSS.
	 *
	 * @property data-modal-show
	 * @type Boolean
	 */
	'data-modal-show': computed('visible', function() {
		return String(this.get('visible'));
	}),

	/**
	 * On did insert element, set element as visible and set data-id.
	 *
	 * @event onDidInsertElement
	 */
	onDidInsertElement: on('didInsertElement', function() {
		const scheduler = this.get('scheduler');

		run.next(scheduler.scheduleOnce.bind(scheduler, this, '_open'));
	}),

	/**
	 * Resolve current promise and close modal.
	 *
	 * @method resolve
	 */
	resolve(data, label = `Component '${this.get('model.fullname')}': fulfillment`) {
		this.get('model.deferred').resolve(data, label);
	},

	/**
	 * Reject current promise and close modal.
	 *
	 * @method reject
	 */
	reject(data, label = `Component '${this.get('model.fullname')}': rejection`) {
		this.get('model.deferred').reject(data, label);
	},

	/**
	 * Action to know when modal is fully opened.
	 *
	 * @method didOpen
	 */
	didOpen() {},

	/**
	 * Safe call to didOpen method.
	 *
	 * @method _safeDidOpen
	 */
	_safeDidOpen() {
		if (this.isDestroyed) {
			return;
		}

		this.didOpen();
	},

	/**
	 * Turn on visibility and send didOpen event.
	 *
	 * @method _open
	 * @private
	 */
	_open() {
		if (this.isDestroyed) {
			return;
		}

		const scheduler = this.get('scheduler');
		const element = this.element;

		this.set('visible', true);

		if (hasTransitions(element)) {
			onTransitionEnd(element, scheduler.scheduleOnce.bind(scheduler, this, '_safeDidOpen'), 'all', true);
		} else {
			this.didOpen();
		}
	},

	/**
	 * Set modal as not visible and remove modal from array later.
	 *
	 * @method _close
	 * @private
	 */
	_close() {
		if (this.isDestroyed) {
			return;
		}

		const scheduler = this.get('scheduler');
		const element = this.element;

		// Close modal.
		this.set('visible', false);

		// Remove modal from array when transition ends.
		if (hasTransitions(element)) {
			onTransitionEnd(element, scheduler.scheduleOnce.bind(scheduler, this, '_remove'), 'all', true);
		} else {
			this._remove();
		}
	},

	/**
	 * Remove itself from service.
	 *
	 * @method _remove
	 * @private
	 */
	_remove() {
		if (this.isDestroyed) {
			return;
		}

		this.get('modal.content').removeObject(this.get('model'));
	},

	/**
	 * When the promise has been settled, close the view.
	 *
	 * @method hasBeenSettled
	 * @private
	 */
	_hasBeenSettled: on('init', function() {
		// Prevent triggering Ember.onerror on promise resolution.
		this.get('model.promise').catch((e) => {
			if (e instanceof Error) {
				return RSVP.reject(e, `Component '${this.get('model.fullname')}': bubble error`);
			}

			// Ignore rejections due to not being real errors here.
			return e;
		}, `Component '${this.get('model.fullname')}': catch real errors or ignore`).finally(
			this._close.bind(this),
			`Component '${this.get('model.fullname')}': close modal`
		);
	}),

	actions: {

		/**
		 * Action to resolve the underlying modal promise directly from the
		 * template, using the passed arguments as resolution values
		 *
		 * @method resolve
		 */
		resolve() {
			this.resolve(...arguments);
		},

		/**
		 * Action to reject the underlying modal promise directly from the
		 * template, using the passed arguments as rejection values
		 *
		 * @method reject
		 */
		reject() {
			this.reject(...arguments);
		}

	}
});
