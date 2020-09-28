import { assert } from '@ember/debug';
import Helper from '@ember/component/helper';
import { typeOf, isNone } from '@ember/utils';
import { inject as service } from '@ember/service';

export default class OpenModalHelper extends Helper {
	@service modal;

	compute([modalName, options], actions) {
		assert(
			'The action `onDone` for the modal service must be a function',
			(isNone(actions.onDone) || Boolean(actions.onDone) && typeOf(actions.onDone) === 'function')
		);
		assert(
			'The action `onFail` for the modal service must be a function',
			(isNone(actions.onFail) || Boolean(actions.onFail) && typeOf(actions.onFail) === 'function')
		);

		return () => {
			this.modal.open(modalName, options).then(
				actions.onDone,
				actions.onFail,
				'open-modal helper'
			);
		};
	}
}
