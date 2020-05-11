import { get, isEqual, isEmpty, isNil, set, unset } from "lodash";

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
      if(typeof schema[key] === "object") {
        this.calcFields(schema[key], prefix + key + ".", fields);
      } else {
        fields.push(prefix + key);
      }
    });
    return(fields);
  }

  convert(fieldName, value) {
    const key = get(this.schema, fieldName);

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
      unset(this.errors, fieldName);
      const nested = fieldName.indexOf(".") > -1;
      if(nested) {
        let currentPath = fieldName.slice(0, fieldName.lastIndexOf("."));
        while(currentPath) {
          if(isEmpty(get(this.errors, currentPath))) {
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
      const fieldRef = get(fieldName, errors) && get(fieldName, this.refs);
      if(typeof fieldRef?.forceUpdate === "function") {
        fieldRef.forceUpdate();
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
      const value = get(values, fieldName);
      if(typeof value !== "undefined") {
        this.setValue(fieldName, value, false, true);
      }
    });
    if(triggerCallback) {
      this.changeCallback();
    }
  }

  setValuesFromParsed(values) {
    this.fields.forEach((fieldName) => {
      const value = get(values, fieldName);
      if(typeof value !== "undefined") {
        this.setValue(fieldName, this.convert(fieldName, value), false, true);
      }
    });
  }

  /*
   * FORMATTING
  */

  // format returns formatter results. If no formatter is defined for the schema key, then the formatter structure is returned assuming true.
  format(fieldName, value) {
    const key = get(this.schema, fieldName);
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
    const key = get(this.schema, fieldName);
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
    for(let i = 0; i < this.fields.length; i++) {
      const{ valid } = this.format(this.fields[i], this.getValue(this.fields[i]));
      if(valid === false) {
        flag = false;
        break;
      }
    }
    return(flag);
  }

  validate(fieldName, triggerCallback = true) {
    const{ errors, formatted, parsed } = this.format(fieldName, this.getValue(fieldName));
    this.setError(fieldName, errors, false, false);
    this.setValue(fieldName, formatted, false, true);
    set(this.parsedData, fieldName, parsed);

    if(triggerCallback) {
      this.changeCallback();
    }
  }

  validateAll(triggerCallback = true) {
    this.fields.forEach((field) => {
      this.validate(field, false);
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

    this.fields.forEach((field) => {
      if((isNil(get(original, field)) || get(original, field) === "") && (isNil(get(data, field)) || get(data, field) === "")) {
        // do nothing
      } else if(!isEqual(get(original, field), get(data, field))) {
        set(differences, field, get(data, field));
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
  scrollToError() {
    this.validateAll(false);
    let fieldName, error, ref;
    for(const field of this.fields) {
      error = this.getError(field);
      if(!isEmpty(error)) {
        ref = get(this.refs, field + ".inputRef.current");
        if(!isNil(ref)) {
          fieldName = field;
          break;
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
        });
      }
      this.setError(fieldName, error);
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
