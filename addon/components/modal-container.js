import Component from '@ember/component';
import layout from '../templates/components/modal-container';
import { inject as service } from '@ember/service';
import { notEmpty } from '@ember/object/computed';

export default class ModalContainerComponent extends Component {
	layout = layout;

	@service modal;

	classNameBindings = ['fullHeight'];

	@notEmpty('modal.content') fullHeight;
}
