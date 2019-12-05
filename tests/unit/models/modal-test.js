import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ModalModel from 'ember-modal-service/models/modal';

const name = 'foo';

let model;

module('Unit | Model | modal', (hooks) => {
	setupTest(hooks);

	hooks.beforeEach(function() {
		this.owner.register('model:modal', ModalModel);

		const factory = this.owner.factoryFor('model:modal');

		model = factory.create({ name });
	});

	test('it has a fullname when has a name', (assert) => {
		assert.equal(model.get('fullname'), `modal-${name}`);
	});

	test('it throws an error if modal has not a name', (assert) => {
		assert.throws(() => {
			const factory = this.owner.factoryFor('model:modal');

			factory.create();
		});
	});

	test('it setups the deferred, promise and fullname objects on init', (assert) => {
		assert.ok(model.get('deferred'));
		assert.ok(model.get('promise'));
		assert.ok(model.get('fullname'));
	});
});
