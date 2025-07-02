import arraySetting from './Array/settings';
import checkboxSetting from './Checkbox/settings';
import dateTimeSetting from './DateAndTime/settings';
import fileSetting from './File/settings';
import multiFileSetting from './MultiFile/settings';
import longAnswerSetting from './LongAnswer/settings';
import numberSetting from './Number/settings';
import radioSetting from './Radio/settings';
import relationSetting from './Relation/settings';
import selectSetting from './Select/settings';
import shortAnswerSetting from './ShortAnswer/settings';
import conditionSetting from './Condition/settings';
import booleanSetting from './Boolean/settings';
import dataSetting from './Data/settings';
import slugSetting from './Slug/settings';
import hrefSetting from './Href/settings';
import dividerSetting from './Divider/settings';
import breakSetting from './Break/settings';
import iconSetting from './Icon/settings';
import multiImage from './MultiImage/settings';
import rangeSetting from './Range/settings';
import functionSetting from './Function/settings';

export const DEFAULT_FORM_INPUTS = {
  ...shortAnswerSetting,
  ...longAnswerSetting,
  ...numberSetting,
  ...dateTimeSetting,
  ...radioSetting,
  ...selectSetting,
  ...checkboxSetting,
  ...fileSetting,
  ...multiFileSetting,
  ...relationSetting,
  ...conditionSetting,
  ...arraySetting,
  ...booleanSetting,
  ...dataSetting,
  ...slugSetting,
  ...hrefSetting,
  ...iconSetting,
  ...multiImage,
  ...rangeSetting,
  ...functionSetting,
};

export const DEFAULT_FORM_FE = {
  ...shortAnswerSetting,
  ...longAnswerSetting,
  ...numberSetting,
  ...dateTimeSetting,
  ...radioSetting,
  ...selectSetting,
  ...checkboxSetting,
  ...fileSetting,
  ...dividerSetting,
  ...breakSetting,
};
