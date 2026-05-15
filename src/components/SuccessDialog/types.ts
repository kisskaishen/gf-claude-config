export interface SuccessDialogProps {
  visible: boolean;
  title?: string;
  description?: string;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  showPrimaryBtn?: boolean;
  showSecondaryBtn?: boolean;
  width?: string;
  buttonSize?: "large" | "default" | "small";
  primaryBtnClass?: string;
  secondaryBtnClass?: string;
  iconClass?: string;
  dialogClass?: string;
}

export interface SuccessDialogEmits {
  (e: "update:visible", value: boolean): void;
  (e: "primaryClick"): void;
  (e: "secondaryClick"): void;
}
