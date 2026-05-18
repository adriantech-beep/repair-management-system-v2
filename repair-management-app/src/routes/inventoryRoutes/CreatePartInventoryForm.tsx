import { useCreatePart } from "@/hooks/useInventory";
import PartInventoryFormBase from "./PartInventoryFormBase";

type CreatePartInventoryFormProps = {
  onCloseModal?: () => void;
};

const CreatePartInventoryForm = ({
  onCloseModal,
}: CreatePartInventoryFormProps) => {
  const { mutateAsync: createPart } = useCreatePart();

  return (
    <PartInventoryFormBase
      mode="create"
      onSubmitForm={createPart}
      onCloseModal={onCloseModal}
    />
  );
};

export default CreatePartInventoryForm;
