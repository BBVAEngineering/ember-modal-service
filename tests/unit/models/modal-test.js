import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ModalModel from 'ember-modal-service/models/modal';

const name = 'foo';

let model;
let factory;

module('Unit | Model | modal', (hooks) => {
	setupTest(hooks);

	hooks.beforeEach(function() {
		this.owner.register('model:modal', ModalModel);

		factory = this.owner.factoryFor('model:modal');

		model = factory.create({ name });
	});

	test('it has a fullname when has a name', (assert) => {
		assert.equal(model.get('fullname'), `modal-${name}`);
	});

	test('it has a fullname with prefix when a prefix is provided', (assert) => {
		const options = { prefix: 'modals/' };

		model = factory.create({ name, options });

		assert.equal(model.get('fullname'), `modals/${name}`);
	});

	test('it throws an error if modal has not a name', (assert) => {
		assert.throws(() => factory.create(), Error, 'Modal must have a name.');
	});

	test('it setups the promise and fullname objects on init', (assert) => {
		assert.ok(model.get('promise'));
		assert.ok(model.get('fullname'));
	});

	test('it tracks the pending promise state', (assert) => {
		assert.equal(model.isPending, true, 'isPending');
		assert.equal(model.isSettled, false, 'isSettled');
		assert.equal(model.isFulfilled, false, 'isFulfilled');
		assert.equal(model.isRejected, false, 'isPisRejected');
	});

	test('it tracks the resolved promise state', async(assert) => {
		model.resolve();

		await model.promise;

		assert.equal(model.isPending, false, 'isPending');
		assert.equal(model.isSettled, true, 'isSettled');
		assert.equal(model.isFulfilled, true, 'isFulfilled');
		assert.equal(model.isRejected, false, 'isPisRejected');
	});

	test('it tracks the rejected promise state', async(assert) => {
		model.reject();

		try {
			await model.promise;
		} catch (e) {
			// Nope
		}

		assert.equal(model.isPending, false, 'isPending');
		assert.equal(model.isSettled, true, 'isSettled');
		assert.equal(model.isFulfilled, false, 'isFulfilled');
		assert.equal(model.isRejected, true, 'isPisRejected');
	});
});
