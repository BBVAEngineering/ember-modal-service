import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import ModalService from 'ember-modal-service/services/modal';
import ModalContainerComponent from 'ember-modal-service/components/modal-container';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';

module('Integration | Component | modal-container', (hooks) => {
	setupRenderingTest(hooks);

	hooks.beforeEach(function() {
		this.owner.register('service:modal', ModalService);
	});

	test('it creates instances of components from model', async function(assert) {
		const object = EmberObject.create({
			fullname: 'modal-foo'
		});
		const MyComponent = ModalContainerComponent.extend({
			modal: {
				content: [object]
			}
		});
		const TestComponent = Component.extend({
			classNames: ['modal-foo']
		});

		this.owner.register('component:modal-container', MyComponent);
		this.owner.register('component:modal-foo', TestComponent);

		await render(hbs `{{modal-container}}`);

		assert.equal(document.querySelectorAll('.modal-foo').length, 1);
	});
});
