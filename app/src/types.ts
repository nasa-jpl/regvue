import { LocationQueryValue } from "vue-router";

// Interface representing the attributes of the root project description
export interface DesignRoot {
  display_name: string;
  links: {
    [key: string]: string;
  };
  version: string;
  children: string[];
}

// Interface representing the fields on a specific register
export interface RegisterField {
  access: string;
  doc: string;
  lsb: number;
  name: string;
  nbits: number;
  reset: number;
  value: number;
}

// Interface representing a register entry
export interface Register {
  id: string;
  name: string;
  addr: number;
  offset: number;
  type: "reg" | "blk" | "mem";
  display_name: string;
  doc: string;
  version?: string;
  fields?: RegisterField[];
  children: string[];
  links: Map<string, string>;
}

// Interface representing the fields necessary for a menu node
export interface MenuNode {
  key: string;
  styleClass: string;
  children?: MenuNode[];
  data: {
    name: string;
    addr: string;
  };
  depth?: number;
  isVisible?: boolean;
}

// Interfaces that defines the properties on a entry in the list
// of suggestions used in Search.vue
export interface Suggestion {
  type: "reg" | "blk" | "mem" | "field";
  name: string;
  path: {
    name: string;
    params: {
      regid: string;
    };
    query?: {
      [key: string]: string | LocationQueryValue | LocationQueryValue[];
    };
  };
}

// Interface representing the overall sharedState object exported from store.ts
export interface SharedState {
  data: {
    root: DesignRoot;
    elements: {
      [key: string]: Register;
    };
  };
  fields: Map<string, string>;
  nodes: MenuNode[];
}

export type DisplayType = "hexadecimal" | "binary" | "decimal";

export type Bit = 0 | 1 | "?";
