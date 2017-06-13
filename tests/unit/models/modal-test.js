import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

const { run } = Ember;

let model;

moduleFor('model:modal', 'Unit | Service | modal', {
	beforeEach() {
		model = this.subject();
	}
});

test('it has a fullname when has a name', (assert) => {
	assert.throws(() => {
		model.get('fullname');
	});

	run(model, 'set', 'name', 'foo');

	assert.equal(model.get('fullname'), 'modal-foo');
});

test('it setups the deferred and promise objects on init', (assert) => {
	assert.ok(model.get('deferred'));
	assert.ok(model.get('promise'));
});
