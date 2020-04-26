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
        calcFields(schema?: {}, prefix?: string, fields?: string[]): string[];
        convert(fieldName: string, value: any): any;
        getError(fieldName: string): string[];
        getErrors(): {};
        setError(fieldName: string, errors: {}, triggerCallback?: boolean): void;
        setErrors(errors: any, triggerCallback?: boolean): void;
        getValue(fieldName: string): any;
        getValues(): {};
        setValue(fieldName: string, value: any, triggerCallback?: boolean): void;
        setValues(values: any, triggerCallback?: boolean): void;
        setValuesFromParsed(values: any): void;
        format(fieldName: string, value: any): {
            errors: any[];
            formatted: any;
            parsed: any;
            valid: boolean;
        };
        mask(fieldName: string, value: any): any;
        isValid(): boolean;
        validate(fieldName: string, triggerCallback?: boolean): void;
        validateAll(triggerCallback?: boolean): void;
        extractDifferences(original: any): {};
        updateSchema(schema: {}): void;
    }
}
