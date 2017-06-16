import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import ModalModel from 'ember-modal-service/models/modal';

const {
	isArray,
	isEmpty,
	run
} = Ember;
const PENDING = undefined;
const RESOLVED = 1;
const REJECTED = 2;

let service;

moduleFor('service:modal', 'Unit | Service | modal', {
	beforeEach() {
		service = this.subject();
	}
});

test('it has an empty array on init', (assert) => {
	assert.ok(isArray(service.get('content')));
	assert.ok(isEmpty(service.get('content')));
});

test('it creates a new modal with a promise', (assert) => {
	run(() => {
		service.open('foo');
		service.open('bar', { bar: 'bar' });
	});

	const content = service.get('content');

	assert.equal(content.length, 2);
	assert.equal(content.objectAt(0).get('name'), 'foo');
	assert.equal(content.objectAt(1).get('name'), 'bar');
	assert.equal(content.objectAt(1).get('options.bar'), 'bar');
	assert.ok(content.objectAt(1).get('deferred'));
	assert.ok(content.objectAt(1).get('promise'));
});

test('it creates only a new modal of same type', (assert) => {
	run(() => {
		service.open('foo');
		service.open('foo');
		service.open('foo');
	});

	const content = service.get('content');

	assert.equal(content.length, 1);
	assert.equal(content.objectAt(0).get('name'), 'foo');

	service.close();

	assert.equal(service.get('content').objectAt(0).get('promise._state'), REJECTED);
});

test('it clears all pending modals', (assert) => {
	const modals = [ModalModel.create({ name: '0' }), ModalModel.create({ name: '1' }), ModalModel.create({ name: '2' })];

	service.get('content').addObjects(modals);

	service.get('content').objectAt(0).get('deferred').resolve();

	service.close();

	assert.equal(service.get('content').objectAt(0).get('promise._state'), RESOLVED);
	assert.equal(service.get('content').objectAt(1).get('promise._state'), REJECTED);
	assert.equal(service.get('content').objectAt(2).get('promise._state'), REJECTED);
});

test('it clears modals by callback when callback is passed', (assert) => {
	const callback = (modal) => (modal.name === 'bar');

	const modals = [ModalModel.create({ name: 'foo' }), ModalModel.create({ name: 'bar' })];

	service.get('content').addObjects(modals);

	service.close(callback);

	assert.equal(service.get('content').findBy('name', 'foo').get('promise._state'), PENDING);
	assert.equal(service.get('content').findBy('name', 'bar').get('promise._state'), REJECTED);
});

test('it clears modals by key-value when key-value is passed', (assert) => {
	const modals = [ModalModel.create({ name: 'foo' }), ModalModel.create({ name: 'bar' })];

	service.get('content').addObjects(modals);

	service.close('name', 'bar');

	assert.equal(service.get('content').findBy('name', 'foo').get('promise._state'), PENDING);
	assert.equal(service.get('content').findBy('name', 'bar').get('promise._state'), REJECTED);
});
