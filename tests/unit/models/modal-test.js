import { moduleFor, test } from 'ember-qunit';

const name = 'foo';

let model;

moduleFor('model:modal', 'Unit | Model | modal', {
	beforeEach() {
		model = this.subject({ name });
	}
});

test('it has a fullname when has a name', (assert) => {
	assert.equal(model.get('fullname'), `modal-${name}`);
});

test('it throws an error if modal has not a name', (assert) => {
	assert.throws(() => {
		model = this.subject();
	});
});

test('it setups the deferred, promise and fullname objects on init', (assert) => {
	assert.ok(model.get('deferred'));
	assert.ok(model.get('promise'));
	assert.ok(model.get('fullname'));
});
