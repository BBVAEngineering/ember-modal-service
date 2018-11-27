import Component from '@ember/component';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';

let component;

moduleForComponent('modal-container', 'Unit | Component | modal-container', {
	unit: true,

	needs: ['service:modal'],

	beforeEach() {
		this.registry.register('component:modal-foo', Component.extend({
			classNames: ['modal-foo']
		}));

		component = this.subject({
			modal: {
				content: A()
			}
		});
	}
});

test('it creates instances of components from model', function(assert) {
	const object = EmberObject.create({
		fullname: 'modal-foo'
	});

	component.get('modal.content').addObject(object);

	this.render();

	assert.equal(component.$('.modal-foo').length, 1);
});
