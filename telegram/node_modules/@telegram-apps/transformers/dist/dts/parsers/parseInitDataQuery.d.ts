export declare const parseInitDataQuery: import('../camel-casing/createCamelCaseSchemaParserGen.js').CamelCaseSchemaParser<string | URLSearchParams, {
    auth_date: Date;
    can_send_after?: number | undefined;
    chat?: ({
        id: number;
        photo_url?: string | undefined;
        type: string;
        title: string;
        username?: string | undefined;
    } & {
        [key: string]: unknown;
    }) | undefined;
    chat_type?: string | undefined;
    chat_instance?: string | undefined;
    hash: string;
    query_id?: string | undefined;
    receiver?: ({
        added_to_attachment_menu?: boolean | undefined;
        allows_write_to_pm?: boolean | undefined;
        first_name: string;
        id: number;
        is_bot?: boolean | undefined;
        is_premium?: boolean | undefined;
        last_name?: string | undefined;
        language_code?: string | undefined;
        photo_url?: string | undefined;
        username?: string | undefined;
    } & {
        [key: string]: unknown;
    }) | undefined;
    start_param?: string | undefined;
    signature: string;
    user?: ({
        added_to_attachment_menu?: boolean | undefined;
        allows_write_to_pm?: boolean | undefined;
        first_name: string;
        id: number;
        is_bot?: boolean | undefined;
        is_premium?: boolean | undefined;
        last_name?: string | undefined;
        language_code?: string | undefined;
        photo_url?: string | undefined;
        username?: string | undefined;
    } & {
        [key: string]: unknown;
    }) | undefined;
} & {
    [key: string]: unknown;
}>;
