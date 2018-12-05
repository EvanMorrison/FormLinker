import test from "ava";
import FormLinker from "../src";

test("set error", t => {
  let fl = new FormLinker({
    data: {
      foo: "bar"
    },
    schema: {
      foo: "string"
    }
  });

  fl.setError("foo", ["new bar"]);
  t.deepEqual(fl.getError("foo"), ["new bar"]);
});

test("set empty error", t => {
  let fl = new FormLinker({
    data: {
      foo: "bar"
    },
    schema: {
      foo: "string",
      bar: {
        baz: {
          qux: "string"
        }
      }
    }
  });

  fl.setError("foo", ["new bar"]);
  t.deepEqual(fl.getError("foo"), ["new bar"]);
  fl.setError("foo", []);
  t.deepEqual(fl.getError("foo"), []);
  fl.setError("bar.baz.qux", ["new bar"]);
  t.deepEqual(fl.getError("bar.baz.qux"), ["new bar"]);
  fl.setError("bar.baz.qux", []);
  t.deepEqual(fl.getError("bar.baz.qux"), []);
  t.deepEqual(fl.errors, {});
});
