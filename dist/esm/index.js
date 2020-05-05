import { get, isEqual, isEmpty, isNil, set, unset } from "lodash";
export default class {
  constructor(options = {}) {
    this.schema = options.schema || {};
    this.fields = this.calcFields();
    this.converters = options.converters || {};
    this.formatters = options.formatters || {};
    this.masks = options.masks || {};
    this.data = {};
    this.setValuesFromParsed(options.data || {}, false);
    this.parsedData = options.data || {};
    this.originalData = Object.assign({}, this.parsedData);
    this.errors = {};
    this.refs = {};

    this.changeCallback = options.onChange || function () {};
  }

  calcFields(schema = this.schema, prefix = "", fields = []) {
    Object.keys(schema).forEach(key => {
      if (typeof schema[key] === "object") {
        this.calcFields(schema[key], prefix + key + ".", fields);
      } else {
        fields.push(prefix + key);
      }
    });
    return fields;
  }

  convert(fieldName, value) {
    const key = get(this.schema, fieldName);

    if (!isNil(key)) {
      key.split(".").forEach(converter => {
        if (!isNil(this.converters[converter])) {
          value = this.converters[converter](value);
        }
      });
    }

    return value;
  }

  getError(fieldName) {
    return get(this.errors, fieldName) || [];
  }

  getErrors() {
    return this.errors;
  }

  setError(fieldName, errors, triggerCallback = true, rerender = true) {
    if (isEmpty(errors)) {
      unset(this.errors, fieldName);
      const nested = fieldName.indexOf(".") > -1;

      if (nested) {
        let currentPath = fieldName.slice(0, fieldName.lastIndexOf("."));

        while (currentPath) {
          if (isEmpty(get(this.errors, currentPath))) {
            unset(this.errors, currentPath);
            currentPath = currentPath.slice(0, currentPath.lastIndexOf("."));
          } else {
            break;
          }
        }
      }
    } else {
      set(this.errors, fieldName, errors);
    }

    if (rerender) {
      const fieldRef = get(this.refs, fieldName);

      if (typeof (fieldRef === null || fieldRef === void 0 ? void 0 : fieldRef.forceUpdate) === "function") {
        fieldRef.forceUpdate();
      }
    }

    if (triggerCallback) {
      this.changeCallback();
    }
  }

  setErrors(errors, triggerCallback = true) {
    this.errors = errors;
    this.fields.forEach(fieldName => {
      const fieldRef = get(fieldName, errors) && get(fieldName, this.refs);

      if (typeof (fieldRef === null || fieldRef === void 0 ? void 0 : fieldRef.forceUpdate) === "function") {
        fieldRef.forceUpdate();
      }
    });

    if (triggerCallback) {
      this.changeCallback();
    }
  }

  getValue(fieldName) {
    return get(this.data, fieldName);
  }

  getValues() {
    return this.data;
  }

  setValue(fieldName, value, triggerCallback = true, setValues = false) {
    set(this.data, fieldName, this.mask(fieldName, value));
    set(this.parsedData, fieldName, this.format(fieldName, value).parsed);
    const fieldRef = get(this.refs, fieldName);

    if (typeof (fieldRef === null || fieldRef === void 0 ? void 0 : fieldRef.forceUpdate) === "function") {
      fieldRef.forceUpdate(setValues);
    }

    if (triggerCallback) {
      this.changeCallback();
    }
  }

  setValues(values, triggerCallback = true) {
    this.fields.forEach(fieldName => {
      const value = get(values, fieldName);

      if (typeof value !== "undefined") {
        this.setValue(fieldName, value, false, true);
      }
    });

    if (triggerCallback) {
      this.changeCallback();
    }
  }

  setValuesFromParsed(values) {
    this.fields.forEach(fieldName => {
      const value = get(values, fieldName);

      if (typeof value !== "undefined") {
        set(this.data, fieldName, this.convert(fieldName, value));
        const fieldRef = get(this.refs, fieldName);

        if (typeof (fieldRef === null || fieldRef === void 0 ? void 0 : fieldRef.forceUpdate) === "function") {
          fieldRef.forceUpdate(true);
        }
      }
    });
  }

  format(fieldName, value) {
    const key = get(this.schema, fieldName);
    let response = {
      errors: [],
      formatted: value,
      parsed: value,
      valid: true
    };

    if (!isNil(key)) {
      key.split(".").forEach(formatter => {
        if (!isNil(this.formatters[formatter])) {
          response = this.formatters[formatter](response);
        }
      });
    }

    return response;
  }

  mask(fieldName, value) {
    const key = get(this.schema, fieldName);
    let response = value;

    if (!isNil(key)) {
      key.split(".").forEach(mask => {
        if (!isNil(this.masks[mask])) {
          response = this.masks[mask].mask(value);
        }
      });
    }

    return response;
  }

  isValid() {
    let flag = true;

    for (let i = 0; i < this.fields.length; i++) {
      const {
        valid
      } = this.format(this.fields[i], this.getValue(this.fields[i]));

      if (valid === false) {
        flag = false;
        break;
      }
    }

    return flag;
  }

  validate(fieldName, triggerCallback = true) {
    const {
      errors,
      formatted,
      parsed
    } = this.format(fieldName, this.getValue(fieldName));
    this.setError(fieldName, errors, false, false);
    this.setValue(fieldName, formatted, false);
    set(this.parsedData, fieldName, parsed);

    if (triggerCallback) {
      this.changeCallback();
    }
  }

  validateAll(triggerCallback = true) {
    this.fields.forEach(field => {
      this.validate(field, false);
    });

    if (triggerCallback) {
      this.changeCallback();
    }
  }

  extractDifferences(original) {
    const differences = {};
    const data = this.parsedData;
    this.fields.forEach(field => {
      if ((isNil(get(original, field)) || get(original, field) === "") && (isNil(get(data, field)) || get(data, field) === "")) {} else if (!isEqual(get(original, field), get(data, field))) {
        set(differences, field, get(data, field));
      }
    });
    return differences;
  }

  setRef(fieldName, ref) {
    if (isNil(ref)) {
      unset(this.refs, fieldName);
    } else {
      set(this.refs, fieldName, ref);
    }
  }

  getRef(fieldName) {
    return get(this.refs, fieldName + ".inputRef.current");
  }

  focusOnField(fieldName) {
    if (isNil(fieldName)) {
      fieldName = this.fields[0];
    }

    const ref = get(this.refs, fieldName + ".inputRef.current");

    if (typeof (ref === null || ref === void 0 ? void 0 : ref.focus) === "function") {
      ref.focus();
    }
  }

  scrollToError() {
    this.validateAll(false);
    let fieldName, error, ref;

    for (const field of this.fields) {
      error = this.getError(field);

      if (!isEmpty(error)) {
        ref = get(this.refs, field + ".inputRef.current");

        if (!isNil(ref)) {
          fieldName = field;
          break;
        }
      }
    }

    if (isNil(fieldName)) {
      return;
    }

    if (typeof ref.focus === "function") {
      ref.focus();

      if (typeof ref.blur === "function") {
        setTimeout(() => {
          ref.blur();
        });
      }

      this.setError(fieldName, error);
    }
  }

  updateSchema(schema) {
    this.schema = schema || {};
    this.fields = this.calcFields();
    this.validateAll();
    this.errors = {};
  }

}
;