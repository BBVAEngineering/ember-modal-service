import Ember from 'ember';
import layout from '../templates/components/modal-container';

const {
	Component,
	computed: { notEmpty },
	inject: { service }
} = Ember;

/**
 * Component that acts like a container to wrap modal object on its own component and view.
 *
 * @extends Ember.Component
 */
export default Component.extend({

	layout,

	/**
	 * Class names.
	 *
	 * @property classNames
	 * @type Array
	 */
	classNames: ['oh'],

	/**
	 * Binded CSS classes.
	 *
	 * @property classNameBindings
	 * @type Array
	 */
	classNameBindings: ['full-height'],

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
