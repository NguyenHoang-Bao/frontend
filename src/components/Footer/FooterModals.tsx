import Modal from '../Modal';
import WarrantyPolicy from '../../components/Policy/WarrantyPolicy';
import ReturnPolicy from '../../components/Policy/ReturnPolicy';
import ShippingPolicy from '../../components/Policy/ShippingPolicy';
import PrivacyPolicy from '../../components/Policy/PrivacyPolicy';

export type ModalType = 'warranty' | 'return' | 'shipping' | 'privacy' | null;

interface FooterModalsProps {
  activeModal: ModalType;
  onClose: () => void;
}

export default function FooterModals({ activeModal, onClose }: FooterModalsProps) {
  return (
    <>
      <Modal isOpen={activeModal === 'warranty'} onClose={onClose} title="Chính sách bảo hành">
        <WarrantyPolicy />
      </Modal>

      <Modal isOpen={activeModal === 'return'} onClose={onClose} title="Chính sách đổi trả">
        <ReturnPolicy />
      </Modal>

      <Modal isOpen={activeModal === 'shipping'} onClose={onClose} title="Chính sách giao hàng">
        <ShippingPolicy />
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={onClose} title="Chính sách bảo mật">
        <PrivacyPolicy />
      </Modal>
    </>
  );
}