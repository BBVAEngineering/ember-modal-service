import Service from '@ember/service';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { isEmpty } from '@ember/utils';

export default class ModalService extends Service {
	content = A();

	open(name, options = {}) {
		const ModalModel = getOwner(this).factoryFor('model:modal');
		const modal = ModalModel.create({ name, options });

		// If the modal is already opened, reject it
		if (this.isOpened(name)) {
			modal.get('deferred').reject(null, `Modal: '${modal.fullname}' is already opened`);
		} else {
			// Add new modal.
			this.content.addObject(modal);
		}

		return modal.get('promise');
	}

	close(key, value) {
		let filter = this.content;

		if (typeof key === 'function') {
			filter = this.content.filter(key);
		} else if (key && value) {
			filter = this.content.filterBy(key, value);
		}

		filter.forEach((modal) => {
			const deferred = modal.get('deferred');

			if (isEmpty(deferred.promise._state)) {
				deferred.reject(null, `Modal: closing '${modal.fullname}'`);
			}
		});
	}

	isOpened(name) {
		const filter = this.content.findBy('name', name);

		return !isEmpty(filter);
	}
}
