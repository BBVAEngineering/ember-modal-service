import { isPresent, typeOf } from '@ember/utils';
import { assert } from '@ember/debug';
import { Promise } from 'rsvp';

const defaultWait = 50;
const defaultTimeout = 0;

function runConditional(conditional) {
	try {
		const ret = conditional();

		return [null, ret];
	} catch (e) {
		return [e, null];
	}
}

function runTimeout(func, wait) {
	if (!wait) {
		requestAnimationFrame(func);
	} else {
		setTimeout(func, wait);
	}
}

/**
 * Wait for a condition to met.
 *
 * @method waitFor
 * @param  Function conditional
 * @param  Number wait
 * @return Ember.RSVP.Promise
 * @public
 */
export default function waitFor(conditional, wait = defaultWait, timeout = defaultTimeout) {
	assert('First argument must be a function and return a boolean', conditional && typeOf(conditional) === 'function');
	assert('Second argument must be a number', isPresent(wait) && typeOf(wait) === 'number');

	return new Promise((resolve, reject) => {
		let cancel = false;

		function checkConditional() {
			if (cancel) {
				return;
			}

			const [err, ret] = runConditional(conditional);

			if (err) {
				reject(err);
			} else if (ret) {
				resolve(ret);
			} else {
				runTimeout(checkConditional, wait);
			}
		}

		runTimeout(checkConditional, wait);

		if (timeout) {
			setTimeout(() => {
				cancel = true;
				reject(new Error('wait for error: timeout.'));
			}, timeout);
		}
	});
}
