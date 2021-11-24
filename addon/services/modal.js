import Service from '@ember/service';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { isEmpty } from '@ember/utils';
import Evented from '@ember/object/evented';

export default class ModalService extends Service.extend(Evented) {
	content = A();

	open(name, options = {}) {
		const ModalModel = getOwner(this).factoryFor('model:modal');
		const model = ModalModel.create({ name, options });

		// If the modal is already opened, reject it
		if (this.isOpened(name)) {
			model.reject(null);
		} else {
			// Add new modal.
			this.content.addObject(model);
		}

		this.trigger('open', model);

		return model.get('promise');
	}

	_closeByModel(model) {
		const destroyCallback = (destroyedModal) => {
			destroyedModal === model && this.trigger('close', model);
		};

		// Setup DOM removal listener
		this.one('will-destroy', destroyCallback);
		// Remove from DOM
		this.content.removeObject(model);
	}

	close(key, value) {
		let filter = this.content;

		if (typeof key === 'function') {
			filter = this.content.filter(key);
		} else if (key && value) {
			filter = this.content.filterBy(key, value);
		}

		filter.forEach((modal) => {
			modal.reject(null);
		});
	}

	isOpened(name) {
		const filter = this.content.findBy('name', name);

		return !isEmpty(filter);
	}
}
