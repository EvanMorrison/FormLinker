import test from "ava";
import FormLinker from "../src";

test("set error", t => {
  const fl = new FormLinker({
    data: {
      foo: "bar"
    },
    schema: {
      foo: "string",
      bar: [
        {
          baz: "string"
        }
      ]
    }
  });

  fl.setError("foo", ["new bar"]);
  t.deepEqual(fl.getError("foo"), ["new bar"]);
  fl.setError("bar[2]baz", ["out of bounds"]);
  t.deepEqual(fl.getError("bar[2]baz"), ["out of bounds"]);
});

test("set empty error", t => {
  const fl = new FormLinker({
    data: {
      foo: "bar"
    },
    schema: {
      foo: "string",
      bar: {
        baz: {
          qux: "string",
          fix: [
            {
              par: "string"
            }
          ]
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
  fl.setError("bar.baz.fix[1]par", ["required"]);
  t.deepEqual(fl.getError("bar.baz.fix[1]par"), ["required"]);
  t.deepEqual(fl.getErrors(), { bar: { baz: { fix: [undefined, { par: ["required"] }] } } });
  fl.setError("bar.baz.fix[1]par", []);
  t.deepEqual(fl.errors, {});
});
