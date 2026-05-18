import { useUpdatePart } from "@/hooks/useInventory";
import type { PartResponse } from "@/types/inventory";
import PartInventoryFormBase from "./PartInventoryFormBase";

type EditPartInventoryFormProps = {
  part: PartResponse;
  onCloseModal?: () => void;
};

const EditPartInventoryForm = ({
  part,
  onCloseModal,
}: EditPartInventoryFormProps) => {
  const { mutateAsync: updatePart } = useUpdatePart(part.id);

  return (
    <PartInventoryFormBase
      mode="edit"
      submitLabel="Save Changes"
      initialValues={{
        partNumber: part.partNumber,
        name: part.name,
        category: part.category,
        stockQuantity: part.stockQuantity,
        supplierPrice: part.supplierPrice,
        sellingPrice: part.sellingPrice,
      }}
      onSubmitForm={updatePart}
      onCloseModal={onCloseModal}
    />
  );
};

export default EditPartInventoryForm;
