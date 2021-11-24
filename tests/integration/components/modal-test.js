import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import RSVP from 'rsvp';
import sinon from 'sinon';
import { waitUntil } from '@ember/test-helpers';
import onTransitionEnd from 'ember-transition-end/utils/on-transition-end';
import { run } from '@ember/runloop';
import { click, find, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ModalModel from 'ember-modal-service/models/modal';
import SchedulerService from 'ember-task-scheduler/services/scheduler';
import ModalComponent from 'ember-modal-service/components/modal';

const { spy } = sinon;
const ANIMATION_DELAY = 300;

let scheduler, didOpenSpy, model;

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

async function waitForScheduler() {
  await settled();

  return waitUntil(
    async () => !scheduler.hasPendingTasks() && !run.hasScheduledTimers(),
    { timeout: 2000 }
  );
}

const assertIsHidden = (assert) =>
  assert.dom('[data-id="modalFoo"]').hasAttribute('data-modal-show', 'false');

const assertIsVisible = (assert) =>
  assert.dom('[data-id="modalFoo"]').hasAttribute('data-modal-show', 'true');

module('Integration | Component | modal', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:scheduler', SchedulerService);
    this.owner.register('model:modal', ModalModel);

    didOpenSpy = spy();
    model = ModalModel.create({ name: 'foo' });

    const layout = hbs`
			{{! template-lint-disable }}
			<button data-id="resolve" {{on 'click' (fn this.resolve 'foo')}}>Resolve</button>
			<button data-id="reject" {{on 'click' (fn this.reject 'foo')}}>Reject</button>
		`;

    this.owner.register(
      'component:my-modal',
      class MyComponent extends ModalComponent {
        layout = layout;
        target = null;
        model = model;
        didOpen = didOpenSpy;
      }
    );

    scheduler = this.owner.lookup('service:scheduler');
  });

  test('it defines the appropriate `data-id` on the component wrapper', async function (assert) {
    await render(hbs`<MyModal/>`);
    await waitForScheduler();

    assert.dom('[data-id="modalFoo"]').exists();
  });

  test('it binds visible class from component', async function (assert) {
    assert.expect(2);

    await render(hbs`<MyModal @visible={{this.visible}}/>`);
    await waitForScheduler();

    this.set('visible', false);

    assertIsHidden(assert);

    this.set('visible', true);

    assertIsVisible(assert);
  });

  test('it hides and removes modal when promise is resolved', async function (assert) {
    await render(hbs`<MyModal/>`);
    await waitForScheduler();

    await waitUntil(() => find('[data-modal-show="true"]'));
    model.resolve();
    await waitUntil(() => find('[data-modal-show="false"]'));

    assert.ok(1);
  });

  test('it hides and removes modal when promise is rejected', async function (assert) {
    await render(hbs`<MyModal/>`);
    await waitForScheduler();

    await waitUntil(() => find('[data-modal-show="true"]'));
    model.reject();
    await waitUntil(() => find('[data-modal-show="false"]'));

    assert.ok(1);
  });

  test('it sends didOpen when it is rendered', async function (assert) {
    await render(hbs`<MyModal/>`);
    await waitForScheduler();

    await waitUntil(() => find('[data-modal-show="true"]'));

    assert.ok(didOpenSpy.calledOnce, 'didOpen called');
  });

  test('it sends didOpen when it is rendered and has transitions', async function (assert) {
    await render(hbs`<MyModal class="animated"/>`);
    await waitForScheduler();

    assert.ok(didOpenSpy.notCalled, 'didOpen called');

    await waitForTimeout(ANIMATION_DELAY);

    assert.ok(didOpenSpy.calledOnce, 'didOpen not called');
  });

  test('it does not sends didOpen when it is destroyed', async function (assert) {
    await render(hbs`
			{{#unless this.destroy}}
				<MyModal class="animated"/>
			{{/unless}}
		`);

    const component = find('[data-id="modalFoo"]');

    await waitForTransitionEnd(component);

    this.set('destroy', true);

    await waitForScheduler();

    assert.ok(didOpenSpy.notCalled, 'didOpen not called');
  });

  test('it resolves promise with action', async function (assert) {
    await render(hbs`<MyModal/>`);
    await waitForScheduler();

    await click('[data-id="resolve"]');

    assert.equal(await model.promise, 'foo');
  });

  test('it rejects promise with action', async function (assert) {
    assert.expect(1);

    await render(hbs`<MyModal/>`);
    await waitForScheduler();

    await click('[data-id="reject"]');

    try {
      await model.promise;
    } catch (foo) {
      assert.equal(foo, 'foo');
    }
  });
});
