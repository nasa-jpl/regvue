import { LocationQueryValue } from "vue-router";

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

// Interface representing a design element such as a register, block, or memory segment
export interface DesignElement {
  id: string;
  name: string;
  addr: number | undefined;
  offset?: number;
  type: "reg" | "blk" | "mem";
  display_name?: string;
  doc?: string;
  version?: string;
  fields?: Field[];
  children?: string[];
  links?: Map<string, string>;
  default_reset?: string;
  data_width: DataWidth;
}

// Interface representing the attributes of the root project description
export interface DesignRoot {
  display_name: string;
  name: string;
  links?: {
    [key: string]: string;
  };
  version: string;
  doc?: string;
  children: string[];
  default_reset?: string;
  data_width?: DataWidth;
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
    resets: string[];
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
  display_name?: string;
  offset: string | number;
  doc?: string;
  version?: string;
  links?: Map<string, string>;
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
