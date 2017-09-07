/* eslint no-magic-numbers:0 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import waitFor from 'ember-task-scheduler/utils/wait-for';

const {
	A,
	run,
	RSVP: { defer }
} = Ember;
const { spy } = sinon;

let component, deferred;

moduleForComponent('modal', 'Unit | Component | modal', {
	needs: ['service:modal', 'service:scheduler', 'model:modal'],

	beforeEach() {
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
	}
});

test('it hides and removes modal when promise is resolved', async function(assert) {
	assert.expect(1);

	this.render();

	await waitFor(() => component.get('visible'));

	run(() => {
		deferred.resolve();
	});

	await waitFor(() => !component.get('visible'));

	assert.notOk(component.get('modal.content').includes(component.get('model')));
});

test('it hides and removes modal when promise is rejected', async function(assert) {
	assert.expect(1);

	this.render();

	await waitFor(() => component.get('visible'));

	run(() => {
		deferred.reject();
	});

	await waitFor(() => !component.get('visible'));

	assert.notOk(component.get('modal.content').includes(component.get('model')));
});

test('it sends didOpen when it is rendered', async function(assert) {
	assert.expect(0);

	spy(component, 'didOpen');

	this.render();

	await waitFor(() => component.didOpen.calledOnce);
});

test('it sends didOpen when it is rendered and has transitions', async function(assert) {
	assert.expect(0);

	spy(component, 'didOpen');

	run(component, 'set', 'classNames', ['animated']);

	this.render();

	await waitFor(() => component.didOpen.notCalled);

	await waitFor(() => component.didOpen.calledOnce);
});

test('it waits for transitions before being removed', async function(assert) {
	assert.expect(1);

	run(component, 'set', 'classNames', ['animated']);

	this.render();

	run(() => {
		deferred.resolve();
	});

	assert.equal(component.get('visible'), false);

	await waitFor(() => !component.get('modal.content').includes(component.get('model')));
});

test('it resolves promise with arguments', async function(assert) {
	assert.expect(1);

	this.render();

	component.get('model.promise').then((foo) => {
		assert.equal(foo, 'foo');
	});

	component.resolve('foo');
});

test('it rejects promise with arguments', async function(assert) {
	assert.expect(1);

	this.render();

	component.get('model.promise').then(null, (foo) => {
		assert.equal(foo, 'foo');
	});

	component.reject('foo');
});

test('it binds visible class from component', async function(assert) {
	this.render();

	run(component, 'set', 'visible', false);

	assert.ok(component.$().attr('data-modal-show') === 'false');

	run(component, 'set', 'visible', true);

	assert.ok(component.$().attr('data-modal-show') === 'true');
});

test('it defines the appropriate `data-id` on the component wrapper', async function(assert) {
	this.render();

	assert.equal(component.$().attr('data-id'), 'modalFoo');
});

