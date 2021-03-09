import { get, isEqual, isEmpty, isNil, set, toPath, unset } from "lodash";

export default class{
  constructor(options = {}) {
    this.schema = options.schema || {};
    this.fields = this.calcFields();
    this.converters = options.converters || {};
    this.formatters = options.formatters || {};
    this.masks = options.masks || {};
    this.data = {};
    this.parsedData = options.data || {};
    this.setValuesFromParsed(options.data || {});
    this.originalData = Object.assign({}, this.parsedData);
    this.errors = {};
    this.refs = {};
    this.changeCallback = options.onChange || function() {};
  }

  // calcFields should be used only to instantiate the fields instance variable
  calcFields(schema = this.schema, prefix = "", fields = []) {
    Object.keys(schema).forEach((key) => {
      if(Array.isArray(schema[key])) {
        fields.push(prefix + key);
        this.calcFields(schema[key][0], prefix + key + "[0]", fields);
      } else if(typeof schema[key] === "object") {
        this.calcFields(schema[key], prefix + key + ".", fields);
      } else {
        fields.push(prefix + key);
      }
    });
    return(fields);
  }

  convert(fieldName, value) {
    let key = get(this.schema, fieldName.replace(/\[(\d+)\]/, "[0]"));

    if(Array.isArray(key)) key = "array";

    if(!isNil(key)) {
      key.split(".").forEach((converter) => {
        if(!isNil(this.converters[converter])) {
          value = this.converters[converter](value);
        }
      });
    }

    return(value);
  }

  /*
  // ERRORS
  */

  // getError gets the errors for a specific field
  getError(fieldName) {
    return(get(this.errors, fieldName) || []);
  }

  // getErrors returns the entire error object
  getErrors() {
    return(this.errors);
  }

  // setError removes errors data if an empty array or sets the errors. It also calls the changeCallback,
  // and rerenders the component if it has registered an update function with the refs.
  setError(fieldName, errors, triggerCallback = true, rerender = true) {
    if(isEmpty(errors)) {
      const path = toPath(fieldName);
      unset(this.errors, path);
      path.pop();
      const nested = path.length;
      if(nested) {
        while(path.length) {
          const currentVal = get(this.errors, path);
          if(isEmpty(currentVal) || (Array.isArray(currentVal) && isEmpty(currentVal.filter(Boolean)))) {
            unset(this.errors, path);
            path.pop();
          } else {
            break;
          }
        }
      }
    } else {
      set(this.errors, fieldName, errors);
    }
    if(rerender) {
      const fieldRef = get(this.refs, fieldName);
      if(typeof fieldRef?.forceUpdate === "function") {
        fieldRef.forceUpdate();
      }
    }
    if(triggerCallback) {
      this.changeCallback();
    }
  }

  // setErrors sets the errors object. It also calls the changeCallback.
  setErrors(errors, triggerCallback = true) {
    this.errors = errors;
    this.fields.forEach(fieldName => {
      if (fieldName.includes("[0]")) {
        const parts = fieldName.split("[0]");
        const length = get(errors, parts[0], []).length;
        for (let i = 0; i < length; i++) {
          const fieldRef = get(errors, parts[0])[i] && get(this.refs, fieldName);
          if(typeof fieldRef?.forceUpdate === "function") {
            fieldRef.forceUpdate();
          }
        }
      } else {
        const fieldRef = get(errors, fieldName) && get(this.refs, fieldName);
        if(typeof fieldRef?.forceUpdate === "function") {
          fieldRef.forceUpdate();
        }
      }
    });
    if(triggerCallback) {
      this.changeCallback();
    }
  }

  /*
  // VALUES
  */

  // getValue gets the value of the field. Sets the value to an empty string if not an array, not a number, not a boolean, and empty.
  getValue(fieldName) {
    return(get(this.data, fieldName));
  }

  // getValues returns the data object.
  getValues() {
    return(this.data);
  }

  /**
   * setValue sets the field value to the masked value passed in. It also calls the changeCallback.
   * The updateActionFlag provides a way to let the associated React component know if this is part of
   * an event like setValues or validateAll, where some additional action may be taken in the component.
   * Leave it as false for regular onChange updates.
   */
  setValue(fieldName, value, triggerCallback = true, updateActionFlag = false) {
    set(this.data, fieldName, this.mask(fieldName, value));
    set(this.parsedData, fieldName, this.format(fieldName, value).parsed);
    const fieldRef = get(this.refs, fieldName);
    if(typeof fieldRef?.forceUpdate === "function") {
      fieldRef.forceUpdate(updateActionFlag);
    }
    if(triggerCallback) {
      this.changeCallback();
    }
  }

  // setValues sets the field value to the masked value for each fieldName path in the values object passed in. It also calls the changeCallback.
  setValues(values, triggerCallback = true) {
    this.fields.forEach((fieldName) => {
      if (fieldName.includes("[0]")) {
        const parts = fieldName.split("[0]");
        const length = get(values, parts[0], []).length;
        for(let i = 0; i < length; i++) {
          const field = parts[0] + "[" + i + "]" + parts[1];
          const value = get(values, field);
          if(value !== undefined) {
            this.setValue(field, value, false, true);
          }
        }
      } else {
        const value = get(values, fieldName);
        if(value !== undefined) {
          this.setValue(fieldName, value, false, true);
        }
      }
    });
    if(triggerCallback) {
      this.changeCallback();
    }
  }

  setValuesFromParsed(values) {
    this.fields.forEach((fieldName) => {
      if (fieldName.includes("[0]")) {
        const parts = fieldName.split("[0]");
        const length = get(values, parts[0], []).length;
        for(let i = 0; i < length; i++) {
          const field = parts[0] + "[" + i + "]" + parts[1];
          const value = get(values, field);
          if (value !== undefined) {
            this.setValue(field, this.convert(field, value), false, true);
          }
        }
      } else {
        const value = get(values, fieldName);
        if(value !== undefined) {
          this.setValue(fieldName, this.convert(fieldName, value), false, true);
        }
      }
    });
  }

  /*
   * FORMATTING
  */

  // format returns formatter results. If no formatter is defined for the schema key, then the formatter structure is returned assuming true.
  format(fieldName, value) {
    const key = get(this.schema, fieldName.replace(/\[\d+\]/g, "[0]"));
    let response = {
      errors: [],
      formatted: value,
      parsed: value,
      valid: true
    };

    if(!isNil(key)) {
      key.split(".").forEach((formatter) => {
        if(!isNil(this.formatters[formatter])) {
          response = this.formatters[formatter](response);
        }
      });
    }

    return(response);
  }

  /*
   * MASKING
  */

  // mask masks data based on schema key. If no mask is defined for the schema key, then the original value is returned.
  mask(fieldName, value) {
    const key = get(this.schema, fieldName.replace(/\[\d+\]/g, "[0]"));
    let response = value;

    if(!isNil(key)) {
      key.split(".").forEach((mask) => {
        if(!isNil(this.masks[mask])) {
          response = this.masks[mask].mask(value);
        }
      });
    }

    return(response);
  }

  /*
   * VALIDATION
  */

  isValid() {
    let flag = true;
    const values = this.getValues();
    for(let i = 0; i < this.fields.length; i++) {
      if(this.fields[i].includes("[0]")) {
        const parts = this.fields[i].split("[0]");
        const length = get(values, parts[0], []).length();
        for(let j = 0; j < length; j++) {
          const field = parts[0] + "[" + j + "]" + parts[1];
          const { valid } = this.format(field, get(values, field));
          if (valid === false) {
            flag = false;
            break;
          }
        }
        if(!flag) break;
      } else {
        const{ valid } = this.format(this.fields[i], this.getValue(this.fields[i]));
        if(valid === false) {
          flag = false;
          break;
        }
      }
    }
    return(flag);
  }

  validate(fieldName, triggerCallback = true, serverValidation = []) {
    const{ errors, formatted, parsed } = this.format(fieldName, this.getValue(fieldName));
    this.setError(fieldName, [...serverValidation, ...errors], false, false);
    this.setValue(fieldName, formatted, false, true);
    set(this.parsedData, fieldName, parsed);

    if(triggerCallback) {
      this.changeCallback();
    }
  }

  validateAll(arg) {
    let triggerCallback = true;
    let serverValidationErrors = {};
    if(typeof arg === "object") {
      serverValidationErrors = arg;
      triggerCallback = false;
    }

    this.fields.forEach(fieldName => {
      if(fieldName.includes("[0]")) {
        const parts = fieldName.split("[0]");
        const length = get(serverValidationErrors, parts[0], []).length;
        for(let i = 0; i < length; i++) {
          const field = parts[0] + "[" + i + "]" + parts[1];
          const error = get(serverValidationErrors, field);
          this.validate(field, false, error);
        }
      } else {
        const error = get(serverValidationErrors, fieldName);
        this.validate(fieldName, false, error);
      }
    });

    if(triggerCallback) {
      this.changeCallback();
    }
  }

  /*
  // Differences
  */

  // extractDifferences returns an object of every key that has changed with the value it has changed to. This is great for sending only changes.
  extractDifferences(original) {
    const differences = {};
    const data = this.parsedData;

    this.fields.forEach((fieldName) => {
      if(fieldName.includes("[0]")) {
        const [p1, p2] = fieldName.split("[0]");
        const length = get(original, p1, []).length;
        for(let i = 0; i < length; i++) {
          const path = p1 + "[" + i + "]" + p2;
          if((isNil(get(original, path)) || get(original, path) === "") && (isNil(get(data, path)) || get(data, path) === "")) {
            // do nothing
          } else if(!isEqual(get(original, path), get(data, path))) {
            set(differences, path, get(data, path));
          }
        }
      } else {
        if((isNil(get(original, fieldName)) || get(original, fieldName) === "") && (isNil(get(data, fieldName)) || get(data, fieldName) === "")) {
          // do nothing
        } else if(!isEqual(get(original, fieldName), get(data, fieldName))) {
          set(differences, fieldName, get(data, fieldName));
        }
      }
    });
    return(differences);
  }

  /*
   * REFS
   */

  /**
   * ref should be an object with keys "forceUpdate" and "inputRef".
   * forceupdate should be a function that causes a rerender of the associated component.
   * inputRef.current should point to the input element rendered by the component,
   * or in the case of MultiSelect, RichEditor, & Summernote, the instance of a React Component.
   */
  setRef(fieldName, ref) {
    if(isNil(ref)) {
      unset(this.refs, fieldName);
    } else {
      set(this.refs, fieldName, ref);
    }
  }

  // returns the ref to the rendered input element for the fieldName
  getRef(fieldName) {
    return(get(this.refs, fieldName + ".inputRef.current"));
  }

  // Sets focus on the input associated with fieldName.
  // Finds the first field in the schema with a ref if no fieldName is given.
  focusOnField(fieldName) {
    let ref;
    if(isNil(fieldName)) {
      for(const field of this.fields) {
        ref = get(this.refs, field + ".inputRef.current");
        if(!isNil(ref)) {
          break;
        }
      }
    } else {
      ref = get(this.refs, fieldName + ".inputRef.current");
    }
    if(typeof ref?.focus === "function") {
      ref.focus();
    }
  }

  // Runs validation on the form and scrolls to the first field in the schema/form on the page with an error.
  scrollToError(errors = {}) {
    this.validateAll(errors);

    let fieldName, error, ref;
    const values = this.getValues();

    for(const field of this.fields) {
      if(field.includes("[0]")) {
        const [p1, p2] = field.split("[0]");
        const length = get(values, p1, []).length;
        for(let i = 0; i < length; i++) {
          const path = p1 + "[" + i + "]" + p2;
          error = this.getError(path);
          if(!isEmpty(error)) {
            ref = get(this.refs, path + ".inputRef.current");
            if(!isNil(ref)) {
              fieldName = path;
              break;
            }
          }
        }
        break;
      } else {
        error = this.getError(field);
        if(!isEmpty(error)) {
          ref = get(this.refs, field + ".inputRef.current");
          if(!isNil(ref)) {
            fieldName = field;
            break;
          }
        }
      }
    }

    if(isNil(fieldName)) {
      return;
    }

    if(typeof ref.focus === "function") {
      ref.focus();
      if(typeof ref.blur === "function") {
        setTimeout(() => {
          ref.blur();
          this.setError(fieldName, error);
        });
      }
    }
  }

  /*
   * SCHEMA
  */

  updateSchema(schema) {
    this.schema = schema || {};
    this.fields = this.calcFields();
    this.validateAll();
    this.errors = {};
  }
};
