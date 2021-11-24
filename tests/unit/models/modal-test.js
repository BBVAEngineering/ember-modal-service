import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ModalModel from 'ember-modal-service/models/modal';

const name = 'foo';

let model;

module('Unit | Model | modal', (hooks) => {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.owner.register('model:modal', ModalModel);

		const factory = this.owner.factoryFor('model:modal');

		model = factory.create({ name });
	});

	test('it has a fullname when has a name', function (assert) {
		assert.equal(model.get('fullname'), `modal-${name}`);
	});

	test('it throws an error if modal has not a name', function (assert) {
		assert.throws(
			() => {
				const factory = this.owner.factoryFor('model:modal');

				factory.create().fullname;
			},
			Error,
			'Modal must have a name.'
		);
	});

	test('it setups the promise and fullname objects on init', function (assert) {
		assert.ok(model.get('promise'));
		assert.ok(model.get('fullname'));
	});

	test('it tracks the pending promise state', function (assert) {
		assert.true(model.isPending, 'isPending');
		assert.false(model.isSettled, 'isSettled');
		assert.false(model.isFulfilled, 'isFulfilled');
		assert.false(model.isRejected, 'isPisRejected');
	});

	test('it tracks the resolved promise state', async function (assert) {
		model.resolve();

		await model.promise;

		assert.false(model.isPending, 'isPending');
		assert.true(model.isSettled, 'isSettled');
		assert.true(model.isFulfilled, 'isFulfilled');
		assert.false(model.isRejected, 'isPisRejected');
	});

	test('it tracks the rejected promise state', async function (assert) {
		model.reject();

		try {
			await model.promise;
		} catch (e) {
			// Nope
		}

		assert.false(model.isPending, 'isPending');
		assert.true(model.isSettled, 'isSettled');
		assert.false(model.isFulfilled, 'isFulfilled');
		assert.true(model.isRejected, 'isPisRejected');
	});
});
