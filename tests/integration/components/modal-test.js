import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import RSVP from 'rsvp';
import sinon from 'sinon';
import { waitUntil } from '@ember/test-helpers';
import { A } from '@ember/array';
import onTransitionEnd from 'ember-transition-end/utils/on-transition-end';
import { run } from '@ember/runloop';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ModalModel from 'ember-modal-service/models/modal';
import SchedulerService from 'ember-task-scheduler/services/scheduler';
import ModalComponent from 'ember-modal-service/components/modal';

const { spy } = sinon;
const ANIMATION_DELAY = 300;

let component, service, content, didOpenSpy, model;

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
	return waitUntil(
		() => !service.hasPendingTasks() && !run.hasScheduledTimers(),
		{ timeout: 2000 }
	);
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

	hooks.beforeEach(async function () {
		this.owner.register('service:scheduler', SchedulerService);
		this.owner.register('model:modal', ModalModel);

		content = A();
		didOpenSpy = spy();
		model = ModalModel.create({ name: 'foo' });

		const layout = hbs`
			<button data-id="resolve" {{on 'click' (action 'resolve' 'foo')}}>Resolve</button>
			<button data-id="reject" {{on 'click' (action 'reject' 'foo')}}>Reject</button>
		`;

		class MyComponent extends ModalComponent {
			layout = layout;
			target = null;
			model = model;
			didOpen = didOpenSpy;
		}

		this.owner.register('component:my-modal', MyComponent);

		service = this.owner.lookup('service:scheduler');
	});

	test('it defines the appropriate `data-id` on the component wrapper', async function (assert) {
		await render(hbs`<MyModal/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForScheduler();

		assert.ok(component);
	});

	test('it binds visible class from component', async function (assert) {
		await render(hbs`<MyModal @visible={{this.visible}}/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForScheduler();

		this.set('visible', false);

		assert.notOk(isVisible(component));

		this.set('visible', true);

		assert.ok(isVisible(component));
	});

	test('it hides and removes modal when promise is resolved', async function (assert) {
		await render(hbs`<MyModal/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForScheduler();

		assert.ok(isVisible(component));

		run(() => {
			model.resolve();
		});

		assert.notOk(isVisible(component));
		assert.equal(content.length, 0);
	});

	test('it hides and removes modal when promise is rejected', async function (assert) {
		await render(hbs`<MyModal/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForScheduler();

		assert.ok(isVisible(component));

		run(() => {
			model.reject();
		});

		assert.notOk(isVisible(component));
		assert.equal(content.length, 0);
	});

	test('it sends didOpen when it is rendered', async function (assert) {
		await render(hbs`<MyModal/>`);

		component = document.querySelector('[data-id="modalFoo"]');
		await waitForScheduler();

		assert.ok(didOpenSpy.calledOnce);
	});

	test('it sends didOpen when it is rendered and has transitions', async function (assert) {
		await render(hbs`<MyModal class="animated"/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForScheduler();

		assert.ok(didOpenSpy.notCalled);

		await waitForTimeout(ANIMATION_DELAY);

		assert.ok(didOpenSpy.calledOnce);
	});

	test('it does not sends didOpen when it is destroyed', async function (assert) {
		await render(hbs`
			{{#unless destroy}}
				<MyModal class="animated"/>
			{{/unless}}
		`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForTransitionEnd(component);

		this.set('destroy', true);

		await waitForScheduler();

		assert.ok(didOpenSpy.notCalled);
	});

	test('it waits for transitions before being removed', async function (assert) {
		await render(hbs`<MyModal class="animated"/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForScheduler();

		run(() => {
			model.resolve();
		});

		assert.notOk(isVisible(component));

		await waitForTimeout(ANIMATION_DELAY);

		assert.equal(content.length, 0);
	});

	test('it resolves promise with arguments', async function (assert) {
		await render(hbs`<MyModal/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		const instance = getComponent(this.owner, component);

		await waitForScheduler();

		instance.resolve('foo');

		assert.equal(await model.promise, 'foo');
	});

	test('it rejects promise with arguments', async function (assert) {
		assert.expect(1);

		await render(hbs`<MyModal/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		const instance = getComponent(this.owner, component);

		await waitForScheduler();

		model.promise.catch((foo) => {
			assert.equal(foo, 'foo');
		});

		instance.reject('foo');
	});

	test('it resolves promise with action', async function (assert) {
		await render(hbs`<MyModal/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForScheduler();

		await click('[data-id="resolve"]');

		assert.equal(await model.promise, 'foo');
	});

	test('it rejects promise with action', async function (assert) {
		assert.expect(1);

		await render(hbs`<MyModal/>`);

		component = document.querySelector('[data-id="modalFoo"]');

		await waitForScheduler();

		model.promise.catch((foo) => {
			assert.equal(foo, 'foo');
		});

		await click('[data-id="reject"]');
	});
});
