import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/modal-container';

export default class ModalContainerComponent extends Component {
  layout = layout;

  @service modal;

  classNameBindings = ['fullHeight'];

  get fullHeight() {
    return !!this.modal.content.length;
  }
}
