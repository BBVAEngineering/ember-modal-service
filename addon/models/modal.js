import Ember from 'ember';

const {
	computed,
	isBlank,
	String: { dasherize },
	RSVP: { defer }
} = Ember;

/**
 * Modal object to instantiate modals over controller.
 *
 * @extends Ember.Object
 */
export default Ember.Object.extend({

	/**
	 * Name of the modal.
	 *
	 * @property name
	 * @type String
	 */
	name: null,

	/**
	 * Options of the modal.
	 *
	 * @property options
	 * @type Object
	 */
	options: null,

	/**
	 * Deferred object.
	 *
	 * @property deferred
	 * @type Object
	 */
	deferred: null,

	/**
	 * Promise object from deferred.
	 *
	 * @property promise
	 * @type Promise
	 */
	promise: computed.reads('deferred.promise'),

	/**
	 * Full name for building controllers and views.
	 *
	 * @property fullname
	 * @type String
	 */
	fullname: computed('name', function() {
		const name = this.get('name');

		if (isBlank(name)) {
			throw new Error('Modal must have a name.');
		}

		return `modal-${dasherize(name)}`;
	}),

	/**
	 * Setup the promise on init.
	 *
	 * @method init
	 */
	init() {
		this._super(...arguments);

		this.set('deferred', defer(`Modal: opening '${this.get('fullname')}'`));
	}

});
