import test from "ava";
import FormLinker from "../src";

test("get default error", t => {
  const fl = new FormLinker({
    data: {
      foo: null
    },
    schema: {
      schema: {
        foo: "string"
      }
    }
  });

  t.deepEqual(fl.getError("foo"), []);
  t.true(fl.isValid());
});

test("get error", t => {
  const fl = new FormLinker({
    data: {
      foo: null
    },
    schema: {
      schema: {
        foo: "string",
        bar: [
          {
            baz: "string"
          }
        ]
      }
    }
  });

  fl.setError("foo", ["test"]);
  t.deepEqual(fl.getError("foo"), ["test"]);
  fl.setError("bar[2]baz", ["required"]);
  t.deepEqual(fl.getError("bar[2]baz"), ["required"]);
  t.true(fl.isValid());
});
