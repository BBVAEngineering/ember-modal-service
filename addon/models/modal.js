import { reads } from '@ember/object/computed';
import EmberObject, { computed } from '@ember/object';
import { dasherize } from '@ember/string';
import { defer } from 'rsvp';
import { isBlank } from '@ember/utils';

export default class ModalModel extends EmberObject {
	name = null;
	options = null;
	deferred = null;

	@reads('deferred.promise') promise;

	@computed('name')
	get fullname() {
		const name = this.name;

		if (isBlank(name)) {
			throw new Error('Modal must have a name.');
		}

		return `modal-${dasherize(name)}`;
	}

	init() {
		super.init(...arguments);

		this.set('deferred', defer(`Modal: open '${this.fullname}'`));
	}
}
