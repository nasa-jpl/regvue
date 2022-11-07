import { InjectionKey, Ref } from "vue";
import { LocationQueryValue } from "vue-router";
import bigInt from "big-integer";

// Types representing the different states a single bit value can take
export type Bit = 0 | 1 | UnknownBit;
export type UnknownBit = "?" | "u";
export const isUnknownBit = (x: unknown): x is UnknownBit =>
  ["?", "u"].includes(x as string);

// Type representing supported sizes in nbits of register elements
export type DataWidth = 16 | 32;
export const isValidDataWidth = (x: unknown): x is DataWidth => {
  try {
    const n = parseInt(x as string);
    return [16, 32].includes(n);
  } catch {
    return false;
  }
};

// How to swap the data
export enum Swap {
  None,
  Byte,
  Word,
}

// Interface representing a design element such as a register, block, or memory segment
export interface DesignElement {
  id: string;
  name: string;
  addr: bigInt.BigInteger | undefined;
  offset?: bigInt.BigInteger;
  type: "reg" | "blk" | "mem";
  desc?: string;
  doc?: string;
  version?: string;
  fields?: Field[];
  children?: string[];
  links?: { text: string; href: string }[];
  default_reset: string;
  resets: string[];
  data_width: DataWidth;
  size?: number;
}

// Interface representing the attributes of the root project description
export interface DesignRoot {
  desc: string;
  name: string;
  links?: { text: string; href: string }[];
  version: string;
  doc?: string;
  children: string[];
  default_reset: string;
  data_width?: DataWidth;
  expanded?: string[];
}

// Type representing the supported ways of displaying bit values
export type DisplayType = "hexadecimal" | "binary" | "decimal";

// Interface representing the fields on a specific register
export interface Field {
  access: string;
  lsb: number;
  name: string;
  nbits: number;
  reset: {
    value: number | string;
    names: string[];
  };
  doc?: string;
  value: Bit[];
  enum?: {
    name: string;
    value: string | number;
    doc: string;
  }[];
}

export interface IncludeElement {
  id: string;
  name: string;
  desc?: string;
  offset: bigInt.BigInteger;
  doc?: string;
  version?: string;
  links?: { text: string; href: string }[];
  type: "include";
  url: string;
  data_width?: number;
}

// Interface representing the fields necessary for a menu node
export interface MenuNode {
  key: string;
  styleClass: string;
  children?: MenuNode[];
  data: {
    name: string;
    version: string;
    addr: string;
  };
  depth?: number;
  isVisible?: boolean;
}

// Interface representing the Register Description File that will be used to build the store
export interface RegisterDescriptionFile {
  schema: {
    version: string;
    name: string;
  };
  root: DesignRoot;
  elements: {
    [key: string]: DesignElement | IncludeElement;
  };
}

// Interfaces that defines the properties on a entry in the list
// of suggestions used in Search.vue
export interface Suggestion {
  type: "reg" | "blk" | "mem" | "field";
  name: string;
  path: {
    name: string;
    params: {
      elementId: string[];
    };
    query?: {
      [key: string]: string | LocationQueryValue | LocationQueryValue[];
    };
  };
}

export interface Rs2JsEventRaw {
  type: "read" | "write";
  addr: number;
  data: number;
}

export interface Rs2JsEvent {
  type: "read" | "write";
  addr: bigInt.BigInteger;
  data: Bit[];
}

export const LastRs2JsEvent: InjectionKey<Ref<Rs2JsEvent | undefined>> =
  Symbol("Rs2JsEvent");
