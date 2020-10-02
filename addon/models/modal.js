import { oneWay } from '@ember/object/computed';
import EmberObject, { computed } from '@ember/object';
import { dasherize } from '@ember/string';
import { defer } from 'rsvp';
import { isBlank } from '@ember/utils';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import { tracked } from '@glimmer/tracking';

export default class ModalModel extends EmberObject.extend(PromiseProxyMixin) {
	name = null;
	options = null;

	// Do not use "PromiseProxyMixin", "@oneWay" does not tracks the state.
	@tracked isPending = true;
	@tracked isSettled = false;
	@tracked isFulfilled = false;
	@tracked isRejected = false;

	@tracked _deferred;

	@oneWay('_deferred.promise') promise;

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

		this._deferred = defer(`Modal: open '${this.fullname}'`);
	}

	resolve() {
		this.isPending = false;
		this.isSettled = true;
		this.isFulfilled = true;
		this.isRejected = false;

		return this._deferred.resolve(...arguments);
	}

	reject() {
		this.isPending = false;
		this.isSettled = true;
		this.isFulfilled = false;
		this.isRejected = true;

		return this._deferred.reject(...arguments);
	}
}
