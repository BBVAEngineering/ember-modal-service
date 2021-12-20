/* eslint-disable no-magic-numbers */
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';

module('Integration | Service | modal', (hooks) => {
	setupRenderingTest(hooks);

	hooks.beforeEach(async function() {
		this.service = this.owner.lookup('service:modal');
	});

	test('it has an empty array on init', function(assert) {
		assert.ok(isArray(this.service.content));
		assert.ok(isEmpty(this.service.content));
	});
});
