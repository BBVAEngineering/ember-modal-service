import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import sinon from 'sinon';
import { waitUntil } from '@ember/test-helpers';
import { A } from '@ember/array';
import onTransitionEnd from 'ember-transition-end/utils/on-transition-end';
import { run } from '@ember/runloop';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ModalModel from 'ember-modal-service/models/modal';
import ModalService from 'ember-modal-service/services/modal';
import SchedulerService from 'ember-task-scheduler/services/scheduler';
import ModalComponent from 'ember-modal-service/components/modal';

const { spy } = sinon;
const ANIMATION_DELAY = 300;

let component, deferred, service, content, didOpenSpy;

function waitForTransitionEnd(element) {
	return new RSVP.Promise((resolve) => {
		onTransitionEnd(element, resolve);
	});
}

function waitForTimeout(timeout) {
	return new RSVP.Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

function waitForScheduler() {
	return waitUntil(() => !service.hasPendingTasks() && !run.hasScheduledTimers(), { timeout: 2000 });
}

function isVisible(element) {
	return element.getAttribute('data-modal-show') === 'true';
}

function getComponent(owner, element) {
	const instances = owner.__container__.lookup('-view-registry:main');

	return instances[element.id];
}

module('Integration | Component | modal', (hooks) => {
	setupRenderingTest(hooks);

	hooks.beforeEach(async function() {
		this.owner.register('service:modal', ModalService);
		this.owner.register('service:scheduler', SchedulerService);
		this.owner.register('model:modal', ModalModel);

		deferred = RSVP.defer();
		content = A();
		didOpenSpy = spy();

		const MyComponent = ModalComponent.extend({
			target: null,
			model: EmberObject.create({
				fullname: 'modal-foo',
				deferred,
				promise: deferred.promise
			}),
			didOpen: didOpenSpy,
			modal: {
				content
			}
		});

		this.owner.register('component:my-modal', MyComponent);

		service = this.owner.lookup('service:scheduler');
	});

	test('it defines the appropriate `data-id` on the component wrapper', async(assert) => {
		await render(hbs `{{my-modal data-id='foo' visible=visible}}`);

		component = document.querySelector('[data-id="foo"]');

		await waitForScheduler();

		assert.ok(component);
	});

	test('it binds visible class from component', async function(assert) {
		await render(hbs `{{my-modal data-id='foo' visible=visible}}`);

		component = document.querySelector('[data-id="foo"]');

		await waitForScheduler();

		this.set('visible', false);

		assert.notOk(isVisible(component));

		this.set('visible', true);

		assert.ok(isVisible(component));
	});

	test('it hides and removes modal when promise is resolved', async(assert) => {
		await render(hbs `{{my-modal data-id='foo'}}`);

		component = document.querySelector('[data-id="foo"]');

		await waitForScheduler();

		assert.ok(isVisible(component));

		run(() => {
			deferred.resolve();
		});

		assert.notOk(isVisible(component));
		assert.equal(content.length, 0);
	});

	test('it hides and removes modal when promise is rejected', async(assert) => {
		await render(hbs `{{my-modal data-id='foo'}}`);

		component = document.querySelector('[data-id="foo"]');

		await waitForScheduler();

		assert.ok(isVisible(component));

		run(() => {
			deferred.reject();
		});

		assert.notOk(isVisible(component));
		assert.equal(content.length, 0);
	});

	test('it sends didOpen when it is rendered', async(assert) => {
		await render(hbs `{{my-modal data-id='foo'}}`);

		component = document.querySelector('[data-id="foo"]');
		await waitForScheduler();

		assert.ok(didOpenSpy.calledOnce);
	});

	test('it sends didOpen when it is rendered and has transitions', async(assert) => {
		await render(hbs `{{my-modal data-id='foo' class='animated'}}`);

		component = document.querySelector('[data-id="foo"]');

		await waitForScheduler();

		assert.ok(didOpenSpy.notCalled);

		await waitForTimeout(ANIMATION_DELAY);

		assert.ok(didOpenSpy.calledOnce);
	});

	test('it does not sends didOpen when it is destroyed', async function(assert) {
		await render(hbs `
			{{#unless destroy}}
				{{my-modal data-id='foo' class='animated'}}
			{{/unless}}
		`);

		component = document.querySelector('[data-id="foo"]');

		await waitForTransitionEnd(component);

		this.set('destroy', true);

		await waitForScheduler();

		assert.ok(didOpenSpy.notCalled);
	});

	test('it waits for transitions before being removed', async(assert) => {
		await render(hbs `{{my-modal data-id='foo' class='animated'}}`);

		component = document.querySelector('[data-id="foo"]');

		await waitForScheduler();

		run(() => {
			deferred.resolve();
		});

		assert.notOk(isVisible(component));

		await waitForTimeout(ANIMATION_DELAY);

		assert.equal(content.length, 0);
	});

	test('it resolves promise with arguments', async function(assert) {
		await render(hbs `{{my-modal data-id='foo'}}`);

		component = document.querySelector('[data-id="foo"]');

		const instance = getComponent(this.owner, component);

		await waitForScheduler();

		instance.resolve('foo');

		assert.equal(await deferred.promise, 'foo');
	});

	test('it rejects promise with arguments', async function(assert) {
		assert.expect(1);

		await render(hbs `{{my-modal data-id='foo'}}`);

		component = document.querySelector('[data-id="foo"]');

		const instance = getComponent(this.owner, component);

		await waitForScheduler();

		deferred.promise.catch((foo) => {
			assert.equal(foo, 'foo');
		});

		instance.reject('foo');
	});
});
