import { ContentSeparator } from './enums/separator';

export default (value: ContentSeparator, custom: string = '') => {
  switch (value) {
    case ContentSeparator.COMMA:
      return ',';
    case ContentSeparator.TAB:
      return '\t';
    case ContentSeparator.CUSTOM:
      return custom;
    default:
      return null;
  }
};
