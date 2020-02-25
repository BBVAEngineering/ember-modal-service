import Ember from 'ember';

const { getOwner, isNone, typeOf } = Ember;

/**
 * Helper to handle the modal opening through the passed arguments
 *
 * @example
 * <a {{action (open-modal 'myModal' optionsForMyModal onDone=(action 'foo')
 * 	onFail=(action 'boo'))}}> Link to open the modal </a>
 *
 * @class OpenModalHelper
 * @extends Ember.Helper
 * @public
 */
export default Ember.Helper.extend({

	/**
	 * Call the modal service with specific parameters
	 *
	 * @param  {Array}     Modal     name and its options
	 * @param  {Object}    actions   Actions that will handle the model service
	 *                               response. Can contain two methods: onDone
	 *                               and onFail
	 * @return {function}  Return the function that should be called as an action
	 */
	compute([modalName, options], actions = {}) {
		Ember.assert(
			'The action `onDone` for the modal service must be a function',
			(isNone(actions.onDone) || Boolean(actions.onDone) && typeOf(actions.onDone) === 'function')
		);
		Ember.assert(
			'The action `onFail` for the modal service must be a function',
			(isNone(actions.onFail) || Boolean(actions.onFail) && typeOf(actions.onFail) === 'function')
		);

		const modal = getOwner(this).lookup('service:modal');

		return function() {
			modal.open(modalName, options).then(
				actions.onDone,
				actions.onFail,
				'open-modal helper'
			);
		};
	}
});
