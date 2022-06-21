import { LocationQueryValue } from "vue-router";

// Types representing the different states a single bit value can take
export type Bit = 0 | 1 | UnknownBit;
export type UnknownBit = "?" | "u";
export const isUnknownBit = (x: unknown): x is UnknownBit =>
  ["?", "u"].includes(x as string);

// Interface representing a design element such as a register, block, or memory segment
export interface DesignElement {
  id: string;
  name: string;
  addr: number;
  offset: number;
  type: "reg" | "blk" | "mem";
  display_name: string;
  doc: string;
  version?: string;
  fields?: Field[];
  children: string[];
  links: Map<string, string>;
}

// Interface representing the attributes of the root project description
export interface DesignRoot {
  display_name: string;
  links: {
    [key: string]: string;
  };
  version: string;
  children: string[];
}

// Type representing the supported ways of displaying bit values
export type DisplayType = "hexadecimal" | "binary" | "decimal";

// Interface representing the fields on a specific register
export interface Field {
  access: string;
  doc: string;
  lsb: number;
  name: string;
  nbits: number;
  reset: number;
  value: Bit[];
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
    [key: string]: DesignElement;
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
