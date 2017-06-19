/* eslint-disable no-magic-numbers */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import ModalComponent from 'ember-modal-service/components/modal';
import wait from 'dummy/tests/helpers/wait';
import hbs from 'htmlbars-inline-precompile';

const { run } = Ember;

let service;

moduleForComponent('modal-container', 'Integration | Service | modal', {
	integration: true,
	beforeEach() {
		// Registry dummy modal.
		this.registry.register('component:modal-foo', ModalComponent.extend({
			id: 'foo',
			attributeBindings: ['id']
		}));

		// Get instance of service.
		service = this.container.lookup('service:modal');

		// Render controller.
		this.render(hbs `{{modal-container}}`);
	},
	afterEach() {
		this.registry.unregister('component:modal-foo');
	}
});

function find(query) {
	return Ember.$(query);
}

test('it renders, resolves and closes new modal', (assert) => {
	assert.expect(4);

	let $element;

	run(() => {
		service.open('foo').then((foo) => {
			assert.equal(foo, 'foo');
		});
	});

	wait(250);

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service.get('content.0.deferred'), 'resolve', 'foo');

	$element = find('#foo:not([data-modal-show="true"])');

	assert.equal($element.length, 1, 'Modal is hidden');

	wait(400);

	$element = find('#foo');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, rejects and closes new modal', (assert) => {
	assert.expect(4);

	let $element;

	run(() => {
		service.open('foo').then(null, (foo) => {
			assert.equal(foo, 'foo');
		});
	});

	wait(250);

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service.get('content.0.deferred'), 'reject', 'foo');

	$element = find('#foo:not([data-modal-show="true"])');

	assert.equal($element.length, 1, 'Modal is hidden');

	wait(400);

	$element = find('#foo');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, rejects and closes new modal from service', (assert) => {
	assert.expect(4);

	let $element;

	run(() => {
		service.open('foo').then(null, () => {
			assert.ok(true);
		});
	});

	wait(250);

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service, 'close', 'name', 'foo');

	$element = find('#foo:not([data-modal-show="true"])');

	assert.equal($element.length, 1, 'Modal is hidden');

	wait(400);

	$element = find('#foo');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});
