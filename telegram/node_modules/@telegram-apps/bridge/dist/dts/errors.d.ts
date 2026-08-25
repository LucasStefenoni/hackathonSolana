export declare const MethodUnsupportedError: import('error-kid').ErrorClass<[method: string, version: string]>, isMethodUnsupportedError: import('error-kid').IsErrorOfKindFn<import('error-kid').CustomErrorWithoutData>;
export declare const MethodParameterUnsupportedError: import('error-kid').ErrorClass<[method: string, param: string, version: string]>, isMethodMethodParameterUnsupportedError: import('error-kid').IsErrorOfKindFn<import('error-kid').CustomErrorWithoutData>;
export declare const LaunchParamsRetrieveError: import('error-kid').ErrorClassWithData<{
    errors: [source: string, error: unknown][];
}, [[source: string, error: unknown][]]>, isLaunchParamsRetrieveError: import('error-kid').IsErrorOfKindFn<import('error-kid').CustomErrorWithData<{
    errors: [source: string, error: unknown][];
}>>;
export declare const InvalidLaunchParamsError: import('error-kid').ErrorClass<[launchParams: string, cause: unknown]>, isInvalidLaunchParamsError: import('error-kid').IsErrorOfKindFn<import('error-kid').CustomErrorWithoutData>;
export declare const UnknownEnvError: import('error-kid').ErrorClass<[]>, isUnknownEnvError: import('error-kid').IsErrorOfKindFn<import('error-kid').CustomErrorWithoutData>;
export declare const InvokeCustomMethodError: import('error-kid').ErrorClass<[error: string]>, isInvokeCustomMethodError: import('error-kid').IsErrorOfKindFn<import('error-kid').CustomErrorWithoutData>;
