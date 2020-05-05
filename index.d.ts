declare module "form-linker" {
  export default FormLinker;
  class FormLinker {
    constructor(options?: {
      data: {},
      converters?: any;
      formatters?: any;
      masks?: any;
      onChange?: () => void;
      schema: {}
    });
    schema: {};
    fields: string[];
    converters?: any;
    formatters?: any;
    masks: any;
    data: {};
    parsedData: {};
    originalData: {};
    errors: {};
    changeCallback(): void;
    /** Used internally by FormLinker */
    calcFields(schema?: {}, prefix?: string, fields?: string[]): string[];
    /** Used internally by FormLinker */
    convert(fieldName: string, value: any): any;
    /** Returns current errors for a given fieldName */
    getError(fieldName: string): string[];
    /** Returns all current errors */
    getErrors(): {};
    /** Set the errors for specific field */
    setError(fieldName: string, errors: string[], triggerCallback?: boolean): void;
    /** Set errors for all fields with a matching property name or path in the errors object param */
    setErrors(errors: {}, triggerCallback?: boolean): void;
    /** Returns the value for a given fieldName */
    getValue(fieldName: string): any;
    /** Returns the current data property */
    getValues(): {};
    /** Set the value for a given fieldName. Sets the "masked" value in this.data and the "formatted" value in this.parsedData values */
    setValue(fieldName: string, value: any, triggerCallback?: boolean): void;
    /** Set the values for all fields with matching property name or path in the values parameter. Runs setValue for each field. */
    setValues(values: {}, triggerCallback?: boolean): void;
    /** Like setValues, but instead of running setValue() for each field, it runs the values through the converters and sets the result in this.data. It does not set or change this.parsedData. */
    setValuesFromParsed(values: any): void;
    /** Used internally by FormLinker. Runs the value through the formatter for the applicable schema type. */
    format(fieldName: string, value: any): {
      errors: string[];
      formatted: any;
      parsed: any;
      valid: boolean;
    };
    /** Used internally by FormLinker */
    mask(fieldName: string, value: any): any;
    /** Runs this.format on each field until it finds one with a validation error and returns false. Returns true if no error is found. */
    isValid(): boolean;
    /** Validates the given field. Internally runs this.format on the given field, then updates the field's errors, data value and parsedData value */
    validate(fieldName: string, triggerCallback?: boolean): void;
    /** Runs this.validate for every field */
    validateAll(triggerCallback?: boolean): void;
    /** Returns an object with fieldNames and values that are different than "original" parameter. If there are no differences returns an empty object */
    extractDifferences(original: any): {};
    /**
     * ref should be an object with keys "forceUpdate" and "inputRef".
     * forceupdate should be a function that causes a rerender of the associated form component.
     * inputRef.current should point to the input element.
     */
    setRef(fieldName: string, ref: {forceUpdate: () => void, inputRef: {current: HTMLElement}}): void;
    /** Returns the ref to the rendered input element for fieldName */
    getRef(fieldName: string): HTMLElement;
    /** Sets focus on the input associated with fieldName */
    focusOnField(fieldName: string): void;
    /** Runs validation on the form and scrolls to the first field in the schema/form on the page with an error. */
    scrollToError(): void;
    /** Updates the schema for the current FormLinker instance - used if the fieldNames change or are set dynamically */
    updateSchema(schema: {}): void;
  }
}
