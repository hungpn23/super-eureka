import { Visibility } from "./enums";

export default (visibility: Visibility) => {
  const desc: Record<Visibility, string> = {
    [Visibility.PUBLIC]: "All other users can use this set",
    [Visibility.PROTECTED]: "Only people with this passcode can use this set",
    [Visibility.PRIVATE]: "Only you can view this set",
  };

  return desc[visibility];
};
