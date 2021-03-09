import test from "ava";
import FormLinker from "../src";

test("extractDifferences returns object with changes", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: 42
      }
    },
    schema: {
      foo: {
        bar: "number"
      }
    }
  });

  const original = {
    foo: {
      bar: 41
    }
  };
  t.deepEqual(fl.extractDifferences(original), { foo: { bar: 42 } });
  t.true(fl.isValid());
});

test("extractDifferences returns empty Object", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: 42
      }
    },
    schema: {
      foo: {
        bar: "number"
      }
    }
  });

  const original = {
    foo: {
      bar: 42
    }
  };
  t.deepEqual(fl.extractDifferences(original), {});
  t.true(fl.isValid());
});

test("extractDifferences multiple fields with 1 different", t => {
  const fl = new FormLinker({
    data: {
      foo: 42,
      bar: 15
    },
    schema: {
      foo: "number",
      bar: "number"
    }
  });

  const original = {
    foo: 41,
    bar: 15
  };
  t.deepEqual(fl.extractDifferences(original), { foo: 42 });
  t.true(fl.isValid());
});

test("extractDifferences multiple fields with many differences", t => {
  const fl = new FormLinker({
    data: {
      foo: 42,
      bar: 15,
      cat: false,
      dog: true,
      happy: true,
      sad: false
    },
    schema: {
      foo: "number",
      bar: "number",
      cat: "boolean",
      dog: "boolean",
      happy: "boolean",
      sad: "boolean"
    }
  });

  const original = {
    foo: 41,
    bar: 15,
    cat: true,
    dog: false,
    happy: false,
    sad: true
  };
  t.deepEqual(fl.extractDifferences(original), { foo: 42, cat: false, dog: true, happy: true, sad: false });
  t.true(fl.isValid());
});

test("extractDifferences multiple nested fields with many differences", t => {
  const fl = new FormLinker({
    data: {
      foo: 42,
      bar: 15,
      girl: {
        happy: true,
        sad: false
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
    },
    schema: {
      foo: "number",
      bar: "number",
      girl: {
        happy: "boolean",
        sad: "boolean"
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

  const original = {
    foo: 41,
    bar: 15,
    girl: {
      happy: false,
      sad: true
    },
    boy: {
      happy: false,
      sad: true,
      hobbies: [
        {
          name: "stamps",
          description: "collecting"
        },
        {
          name: "baseball cards"
        }
      ]
    }
  };
  t.deepEqual(
    fl.extractDifferences(original),
    {
      foo: 42,
      girl: {
        happy: true,
        sad: false
      },
      boy: {
        happy: true,
        sad: false,
        hobbies: [
          {
            favorite: {
              name: "Elvis",
              type: "first class"
            },
            keywords: [
              "geeky",
              "sticky"
            ],
            yearStarted: 2000
          },
          {
            description: "collecting",
            favorite: {
              name: "Hank Aaron",
              type: "player"
            },
            keywords: [
              "cool",
              "sports",
              "valuable"
            ],
            yearStarted: 1990
          }
        ]

      }
    });
  t.true(fl.isValid());
});
