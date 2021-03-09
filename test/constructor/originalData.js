import FormLinker from "../../src";
import test from "ava";
import { NumberFormatter } from "form-formatters";

test("schema no original data", t => {
  const fl = new FormLinker({
    schema: {
      foo: "string.required"
    }
  });

  t.deepEqual({}, fl.originalData);
});

test("schema simple original data", t => {
  const fl = new FormLinker({
    data: {
      foo: "bar"
    },
    schema: {
      foo: "string.required"
    }
  });

  t.deepEqual({ foo: "bar" }, fl.originalData);
});

test("complex original data", t => {
  const data = {
    foo: 23,
    bar: 42,
    girl: {
      happy: true,
      sad: false,
      personality: {
        mood: "pleasant",
        quality: 10
      }
    },
    boy: {
      happy: true,
      sad: false,
      hobbies: [
        {
          name: "stamps",
          description: "collecting",
          yearStarted: 2000,
          keywords: ["geeky", "sticky"],
          favorite: {
            name: "Elvis",
            type: "first class"
          }
        },
        {
          name: "baseball cards",
          description: "collecting",
          yearStarted: 1990,
          keywords: ["cool", "sports", "valuable"],
          favorite: {
            name: "Hank Aaron",
            type: "player"
          }
        }
      ]
    }
  };

  const formatters = {
    number: NumberFormatter
  };

  const fl = new FormLinker({
    data: data,
    formatters: formatters,
    schema: {
      foo: "number",
      bar: "number",
      girl: {
        happy: "boolean",
        sad: "boolean",
        personality: {
          mood: "string",
          quality: "number"
        }
      },
      boy: {
        happy: "boolean",
        sad: "boolean",
        hobbies: [{
          name: "string",
          description: "string",
          yearStarted: "number",
          keywords: "array",
          favorite: {
            name: "string",
            type: "string"
          }
        }]
      }
    }
  });

  t.deepEqual(data, fl.originalData);
});
