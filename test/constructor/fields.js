import FormLinker from "../../src";
import test from "ava";

test("schema simple fields", t => {
  const fl = new FormLinker({
    schema: {
      foo: "string.required"
    }
  });

  t.deepEqual(["foo"], fl.fields);
});

test("schema fields", t => {
  const fl = new FormLinker({
    schema: {
      foo: "number",
      bar: "number",
      girl: {
        happy: "boolean",
        sad: "boolean",
        personality: {
          mood: "string",
          quality: "number"
        },
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
      },
      boy: {
        happy: "boolean",
        sad: "boolean"
      }
    }
  });

  t.deepEqual([
    "foo",
    "bar",
    "girl.happy",
    "girl.sad",
    "girl.personality.mood",
    "girl.personality.quality",
    "girl.hobbies",
    "girl.hobbies[0]name",
    "girl.hobbies[0]description",
    "girl.hobbies[0]yearStarted",
    "girl.hobbies[0]keywords",
    "girl.hobbies[0]favorite.name",
    "girl.hobbies[0]favorite.type",
    "boy.happy",
    "boy.sad"],
  fl.fields);
});
