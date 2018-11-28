import Component from '@ember/component';
import layout from '../templates/components/modal-container';
import { inject as service } from '@ember/service';
import { notEmpty } from '@ember/object/computed';

/**
 * Component that acts like a container to wrap modal object on its own component and view.
 *
 * @extends Ember.Component
 */
export default Component.extend({

	layout,

	/**
	 * Binded CSS classes.
	 *
	 * @property classNameBindings
	 * @type Array
	 */
	classNameBindings: ['fullHeight'],

	/**
	 * Show set 100% height.
	 *
	 * @property fullHeight
	 * @type Boolean
	 */
	fullHeight: notEmpty('modal.content'),

	/**
	 * Modal service injection.
	 *
	 * @property modal
	 * @type Object
	 */
	modal: service('modal')

});
