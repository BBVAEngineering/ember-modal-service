import ModalComponent from 'ember-modal-service/components/modal';
import sinon from 'sinon';

export default class CustomModalComponent extends ModalComponent {
  didOpen = sinon.spy();
}
