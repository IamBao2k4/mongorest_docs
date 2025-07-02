import { lazy } from 'react';

const ShortAnswer = lazy(() => import('./ShortAnswer'));
const Relation = lazy(() => import('./Relation'));
const BooleanCustom = lazy(() => import('./Boolean'));
const Slug = lazy(() => import('./Slug'));
const RadioComp = lazy(() => import('./Radio'));
const DatePickerComp = lazy(() => import('./DateAndTime'));
const Number = lazy(() => import('./Number'));
const FileUpload = lazy(() => import('./File'));
const TextEditor = lazy(() => import('./LongAnswer'));
const MultiFile = lazy(() => import('./MultiFile'));
const Select = lazy(() => import('./Select'));
const ArrayComp = lazy(() => import('./Array'));

export const Fields = {
  ShortAnswer,
  TextEditor,
  BooleanCustom,
  UriKeyGen: Slug,
  Relation,
  RadioComp,
  DatePickerComp,
  NumberInput: Number,
  FileUpload,
  MultiFile,
  Select,
  Array: ArrayComp,
};
