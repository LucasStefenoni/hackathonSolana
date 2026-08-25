export declare const LaunchParamsSchema: import('valibot').LooseObjectSchema<{
    tgWebAppBotInline: import('valibot').OptionalSchema<import('valibot').SchemaWithPipe<[import('valibot').StringSchema<undefined>, import('valibot').TransformAction<string, boolean>]>, undefined>;
    tgWebAppData: import('valibot').OptionalSchema<import('../index.js').CamelCaseQueryTransformerPipe<import('valibot').LooseObjectSchema<{
        auth_date: import('valibot').SchemaWithPipe<[import('valibot').StringSchema<undefined>, import('valibot').TransformAction<string, Date>, import('valibot').DateSchema<undefined>]>;
        can_send_after: import('valibot').OptionalSchema<import('valibot').SchemaWithPipe<[import('valibot').StringSchema<undefined>, import('valibot').TransformAction<any, number>, import('valibot').IntegerAction<number, undefined>]>, undefined>;
        chat: import('valibot').OptionalSchema<import('valibot').LazySchema<import('../camel-casing/createJsonCamelCaseGen.js').CamelCaseJsonTransformerPipe<import('valibot').LooseObjectSchema<{
            id: import('valibot').NumberSchema<undefined>;
            photo_url: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
            type: import('valibot').StringSchema<undefined>;
            title: import('valibot').StringSchema<undefined>;
            username: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
        }, undefined>, false>>, undefined>;
        chat_type: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
        chat_instance: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
        hash: import('valibot').StringSchema<undefined>;
        query_id: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
        receiver: import('valibot').OptionalSchema<import('valibot').LazySchema<import('../camel-casing/createJsonCamelCaseGen.js').CamelCaseJsonTransformerPipe<import('valibot').LooseObjectSchema<{
            added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            first_name: import('valibot').StringSchema<undefined>;
            id: import('valibot').NumberSchema<undefined>;
            is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            last_name: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
            language_code: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
            photo_url: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
            username: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
        }, undefined>, false>>, undefined>;
        start_param: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
        signature: import('valibot').StringSchema<undefined>;
        user: import('valibot').OptionalSchema<import('valibot').LazySchema<import('../camel-casing/createJsonCamelCaseGen.js').CamelCaseJsonTransformerPipe<import('valibot').LooseObjectSchema<{
            added_to_attachment_menu: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            allows_write_to_pm: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            first_name: import('valibot').StringSchema<undefined>;
            id: import('valibot').NumberSchema<undefined>;
            is_bot: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            is_premium: import('valibot').OptionalSchema<import('valibot').BooleanSchema<undefined>, undefined>;
            last_name: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
            language_code: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
            photo_url: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
            username: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
        }, undefined>, false>>, undefined>;
    }, undefined>, false>, undefined>;
    tgWebAppDefaultColors: import('valibot').OptionalSchema<import('../camel-casing/createJsonCamelCaseGen.js').CamelCaseJsonTransformerPipe<import('../index.js').CamelCaseTransformerPipe<import('valibot').RecordSchema<import('valibot').SchemaWithPipe<[import('valibot').StringSchema<undefined>, import('valibot').TransformAction<string, import('@telegram-apps/types').KnownThemeParamsKey>]>, import('valibot').SchemaWithPipe<[import('valibot').UnionSchema<[import('valibot').StringSchema<undefined>, import('valibot').NumberSchema<undefined>], any>, import('valibot').TransformAction<string | number, string>, import('valibot').CheckAction<`#${string}`, undefined>]>, undefined>, false>, false>, undefined>;
    tgWebAppFullscreen: import('valibot').OptionalSchema<import('valibot').SchemaWithPipe<[import('valibot').StringSchema<undefined>, import('valibot').TransformAction<string, boolean>]>, undefined>;
    tgWebAppPlatform: import('valibot').StringSchema<undefined>;
    tgWebAppShowSettings: import('valibot').OptionalSchema<import('valibot').SchemaWithPipe<[import('valibot').StringSchema<undefined>, import('valibot').TransformAction<string, boolean>]>, undefined>;
    tgWebAppStartParam: import('valibot').OptionalSchema<import('valibot').StringSchema<undefined>, undefined>;
    tgWebAppThemeParams: import('../camel-casing/createJsonCamelCaseGen.js').CamelCaseJsonTransformerPipe<import('../index.js').CamelCaseTransformerPipe<import('valibot').RecordSchema<import('valibot').SchemaWithPipe<[import('valibot').StringSchema<undefined>, import('valibot').TransformAction<string, import('@telegram-apps/types').KnownThemeParamsKey>]>, import('valibot').SchemaWithPipe<[import('valibot').UnionSchema<[import('valibot').StringSchema<undefined>, import('valibot').NumberSchema<undefined>], any>, import('valibot').TransformAction<string | number, string>, import('valibot').CheckAction<`#${string}`, undefined>]>, undefined>, false>, false>;
    tgWebAppVersion: import('valibot').StringSchema<undefined>;
}, undefined>;
