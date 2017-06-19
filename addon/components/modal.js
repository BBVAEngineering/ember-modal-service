/* eslint-disable quote-props, no-magic-numbers */
import Ember from 'ember';

const {
	Component,
	computed,
	inject: { service },
	observer,
	on,
	run: { later },
	String: { camelize }
} = Ember;

export const ANIMATION_DELAY = 400;

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
	attributeBindings: ['data-modal-show', 'role', 'data-id'],

	/**
	 * HTML role.
	 *
	 * @property role
	 * @type String
	 */
	role: 'dialog',

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
	'data-id': null,

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
	 * Animation appearance delay.
	 *
	 * @property animationDelay
	 * @type Number
	 */
	animationDelay: 25,

	/**
	 * On did insert element, scroll to top and set element as visible.
	 *
	 * @method didInsertElement
	 */
	didInsertElement() {
		this._super();

		const animationDelay = this.get('animationDelay');

		later(() => {
			if (!this.isDestroyed) {
				this.set('visible', true);
			}
		}, animationDelay);

		this.set('data-id', camelize(this.get('model.fullname')));
	},


	/**
	 * When the promise has been settled, close the view.
	 *
	 * @method hasBeenSettled
	 * @private
	 */
	_hasBeenSettled: on('init', function() {
		this.get('model.promise').always(() => {
			this._close();
		});
	}),

	/**
	 * Observes the visible property to toggle actions.
	 *
	 * @method visibleDidChange
	 */
	visibleDidChange: observer('visible', function() {
		const visible = this.get('visible');

		if (visible) {
			this.didOpen();
		} else {
			this.willClose();
		}
	}),

	/**
	 * Resolve current promise and close modal.
	 *
	 * @method resolve
	 */
	resolve() {
		const deferred = this.get('model.deferred');

		deferred.resolveWith(this, arguments);
	},

	/**
	 * Reject current promise and close modal.
	 *
	 * @method reject
	 */
	reject() {
		const deferred = this.get('model.deferred');

		deferred.rejectWith(this, arguments);
	},

	/**
	 * Open action.
	 *
	 * @method open
	 * @return Boolean
	 */
	didOpen() {},

	/**
	 * Close action.
	 *
	 * @method close
	 * @return Boolean
	 */
	willClose() {},

	/**
	 * Set modal as not visible and remove modal from array later.
	 *
	 * @method _close
	 * @private
	 */
	_close() {
		// Close modal.
		this.set('visible', false);

		// Remove modal from array.
		later(this, this._remove, ANIMATION_DELAY);
	},

	/**
	 * Remove itself from service.
	 *
	 * @method _remove
	 * @private
	 */
	_remove() {
		this.get('modal.content').removeObject(this.get('model'));
	},

	actions: {

		/**
		 * Action to resolve the underlying modal promise directly from the,
		 * template, using the passed arguments as resolution values
		 *
		 * @method resolveModal
		 */
		resolveModal() {
			this.resolve(...arguments);
		},

		/**
		 * Action to reject the underlying modal promise directly from the,
		 * template, using the passed arguments as rejection values
		 *
		 * @method resolveModal
		 */
		rejectModal() {
			this.reject(...arguments);
		}
	}
});
