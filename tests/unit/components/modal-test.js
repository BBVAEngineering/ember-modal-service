import $ from 'jquery';
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import wait from 'dummy/tests/helpers/wait';

const {
	A,
	run,
	RSVP: { defer }
} = Ember;

let component, deferred, stub;

const WAIT_TIME = 250;

moduleForComponent('modal', 'Unit | Component | modal', {
	unit: true,

	needs: ['service:modal', 'model:modal'],

	beforeEach() {
		stub = sinon.stub(Ember.Test.adapter, 'exception');
		deferred = defer();

		component = this.subject({
			target: null,
			model: Ember.Object.create({
				fullname: 'modal-foo',
				deferred,
				promise: deferred.promise
			}),
			modal: {
				content: A()
			}
		});
	},

	afterEach() {
		stub.restore();
	}
});

test('it hides and removes modal when promise is resolved', (assert) => {
	run(() => {
		component.set('visible', true);
		deferred.resolve();
	});

	assert.equal(component.get('visible'), false);

	wait(WAIT_TIME);

	assert.notOk(component.get('modal.content').includes(component.get('model')));
});

test('it hides and removes modal when promise is rejected', (assert) => {
	run(() => {
		component.set('visible', true);

		deferred.reject();
	});

	assert.equal(component.get('visible'), false);

	wait(WAIT_TIME);

	assert.notOk(component.get('modal.content').includes(component.get('model')));
});

test('it sends actions when visible changes', (assert) => {
	sinon.spy(component, 'didOpen');
	sinon.spy(component, 'willClose');

	run(component, 'set', 'visible', true);

	assert.ok(component.didOpen.calledOnce);

	run(component, 'set', 'visible', false);

	assert.ok(component.willClose.calledOnce);
});

test('it resolves promise with arguments', (assert) => {
	assert.expect(1);

	component.get('model.promise').then((foo) => {
		assert.equal(foo, 'foo');
	});

	component.resolve('foo');
});

test('it rejects promise with arguments', (assert) => {
	assert.expect(1);

	component.get('model.promise').then(null, (foo) => {
		assert.equal(foo, 'foo');
	});

	component.reject('foo');
});

test('it binds visible class from component', function(assert) {
	this.render();

	run(component, 'set', 'visible', false);

	assert.ok(component.$().attr('data-modal-show') === 'false');

	run(component, 'set', 'visible', true);

	assert.ok(component.$().attr('data-modal-show') === 'true');
});

test('it defines the appropriate `data-id` on the component wrapper', function(assert) {
	this.render();

	assert.equal(component.$().attr('data-id'), 'modalFoo');
});
