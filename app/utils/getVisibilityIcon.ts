import { Visibility } from "./enums";

export default (visibility: Visibility) => {
  const icons: Record<Visibility, string> = {
    [Visibility.PUBLIC]: "i-lucide-globe",
    [Visibility.PROTECTED]: "i-lucide-globe-lock",
    [Visibility.PRIVATE]: "i-lucide-lock",
  };

  return icons[visibility];
};
