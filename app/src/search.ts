import format from "src/format";
import lunr from "lunr";
import { DesignElement } from "src/types";

// Creates a lunr.Index object that can be used to search data.elements
export const createSearchIndex = (elements: Map<string, DesignElement>) => {
  return lunr((builder: lunr.Builder) => {
    // Set the tokenizer to only seperate search terms on carriage return (\r)
    // or newline (\n)
    lunr.tokenizer.separator = /[\r|\n]/;

    // Prevent search fields from being shortened
    builder.pipeline.remove(lunr.stemmer);

    // Prevent stop words (things like "and", "or", "the") from being ignored
    builder.pipeline.remove(lunr.stopWordFilter);

    // Prevent punctuation from being removed from search fields
    builder.pipeline.remove(lunr.trimmer);

    // Each call to .field() adds a new property that objects can be searched on
    builder.field("id", { boost: 50 });
    builder.field("name", { boost: 100 });
    builder.field("addr");
    builder.field("doc");

    // Add all reg/blk/mem elements to the search index
    for (const document of elements.values()) {
      builder.add(
        {
          id: document.id,
          name: document.name,
          doc: document.doc,
          addr: format.getStringRepresentation(
            document.addr,
            "hexadecimal",
            document.data_width
          ),
        },
        { boost: 25 } // prioritize registers over fields
      );

      document.fields?.forEach((field: { name: string; doc?: string }) => {
        builder.add({
          id: document.id + ":" + field.name,
          name: field.name,
          doc: field.doc,
        });
      });
    }
  });
};
