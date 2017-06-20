import Ember from 'ember';
import ModalModel from 'ember-modal-service/models/modal';

const {
	A,
	isEmpty,
	Service,
	get
} = Ember;

/**
 * Service that opens and closes modals.
 *
 * To open a modal use the method `open` with the name
 * and the options of the modal.
 *
 * ```javascript
 * this.get('modal').open('foo', { bar: 'bar' });
 * ```
 *
 * The returning value of the modal is a promise that is resolved
 * or rejected when the modal is closed.
 *
 * ```javascript
 * this.get('modal').open('foo').then(() => {
 *     // modal closed.
 * });
 * ```
 *
 * In order to register a new modal, you need to register the modal
 * object in the application container.
 *
 * ```javascript
 * App.ModalFooComponent = Core.ModalComponent.extend();
 * ```
 *
 * All the modals are shown in the modal container.
 *
 * ```html
 * {{! templates/application.hbs }}
 * {{modal-container}}
 * ```
 *
 * You can close all modals by using the `close` method.
 *
 * ```javascript
 * this.get('modal').close();
 * ```
 *
 * Or just some of them.
 *
 * ```javascript
 * this.get('modal').close((modal) => {
 *   return modal.name === 'foo';
 * });
 * ```
 *
 * ```javascript
 * this.get('modal').close('name', 'foo');
 * ```
 *
 * @extends Ember.Service
 */
export default Service.extend({

	/**
	 * Array model.
	 *
	 * @property content
	 * @type Array
	 */
	content: null,

	/**
	 * Setups objects in the service.
	 *
	 * @method init
	 */
	init() {
		this._super(...arguments);

		this.set('content', A());
	},

	/**
	 * Creates new modal object and insert it in the array.
	 *
	 * @method open
	 * @param  {String} name
	 * @param  {Object} options
	 * @return Promise
	 */
	open(name, options = {}) {
		const modal = ModalModel.create({ name, options });

		// If the modal is already opened, reject it
		if (this.isOpened(name)) {
			modal.get('deferred').reject(null, `Modal: '${this.get('model.fullname')}' is already opened`);
		} else {
			// Add new modal.
			this.get('content').addObject(modal);
		}

		return modal.get('promise');
	},

	/**
	 * Close all open modals by rejecting each promise.
	 *
	 * @method close
	 */
	close(key, value) {
		let filter = this.get('content');

		if (typeof key === 'function') {
			filter = this.get('content').filter(key);
		} else if (key && value) {
			filter = this.get('content').filterBy(key, value);
		}

		filter.forEach((modal) => {
			const deferred = modal.get('deferred');

			if (isEmpty(get(deferred, 'promise._state'))) {
				deferred.reject(null, `Modal: closing '${this.get('model.fullname')}'`);
			}
		});
	},

	/**
	 * Test by name if a modal is already opened opened.
	 *
	 * @method isOpen
	 */
	isOpened(name) {
		const filter = this.get('content').findBy('name', name);

		return !isEmpty(filter);
	}
});
