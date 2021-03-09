import test from "ava";
import FormLinker from "../src";

test("get value", t => {
  const fl = new FormLinker({
    data: {
      foo: "bar"
    },
    schema: {
      foo: "string"
    }
  });

  t.deepEqual(fl.getValue("foo"), "bar");
  t.true(fl.isValid());
});

test("Deep Data", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: "Test",
        baz: [
          { zip: "not this" },
          {
            zip: "here it is"
          }
        ]
      }
    },
    schema: {
      foo: {
        bar: "string",
        baz: [
          {
            zip: "string"
          }
        ]
      }
    }
  });

  t.is(fl.getValue("foo.bar"), "Test");
  t.is(fl.getValue("foo.baz[1]zip"), "here it is");
  t.true(fl.isValid());
});

test("Is a Boolean", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: true
      }
    },
    schema: {
      foo: {
        bar: "boolean"
      }
    }
  });

  t.is(fl.getValue("foo.bar"), true);
  t.true(fl.isValid());
});

test("Is a empty Array", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: []
      }
    },
    schema: {
      foo: {
        bar: "array"
      }
    }
  });

  t.is(fl.getValue("foo.bar").length, 0);
  t.true(fl.isValid());
});

test("Is a Number", t => {
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

  t.is(fl.getValue("foo.bar"), 42);
  t.true(fl.isValid());
});

test("Deep Data 2", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: "Test"
      }
    },
    schema: {
      foo: {
        bar: "string"
      }
    }
  });

  t.is(fl.getValue("foo.bar"), "Test");
  t.true(fl.isValid());
});

test("Deep data boolean", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: true
      }
    },
    schema: {
      foo: {
        bar: "boolean"
      }
    }
  });

  t.is(fl.getValue("foo.bar"), true);
  t.true(fl.isValid());
});

test("Deep data empty Array", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: []
      }
    },
    schema: {
      foo: {
        bar: "array"
      }
    }
  });

  t.is(fl.getValue("foo.bar").length, 0);
  t.true(fl.isValid());
});

test("Deep data number", t => {
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

  t.is(fl.getValue("foo.bar"), 42);
  t.true(fl.isValid());
});

test("Invalid deep data number", t => {
  const fl = new FormLinker({
    data: {
      foo: {
        bar: null
      }
    },
    schema: {
      foo: {
        bar: "number.required"
      }
    }
  });

  t.is(fl.getValue("foo.bar"), null);
  t.true(fl.isValid());
});

test("Deep data array in array", t => {
  const fl = new FormLinker({
    data: {
      foo: [
        {},
        {},
        {
          keywords: ["bar", "biz"]
        }
      ]
    },
    schema: {
      foo: [
        {
          keywords: "array"
        }
      ]
    }
  });

  t.deepEqual(fl.getValue("foo[2]keywords"), ["bar", "biz"]);
  t.true(fl.isValid());
});
