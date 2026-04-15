export declare const serverCardJsonSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    version: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    websiteUrl: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    repository: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    icons: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        src: import("@sinclair/typebox").TString;
        sizes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        mimeType: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>>;
    remotes: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TString;
        url: import("@sinclair/typebox").TString;
        authentication: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            required: import("@sinclair/typebox").TBoolean;
            schemes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        }>>;
    }>>;
    capabilities: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        tools: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            listChanged: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        }>>;
        resources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            listChanged: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        }>>;
        prompts: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            listChanged: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        }>>;
    }>>;
    provider: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        url: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export declare function asPlainJsonSchema(): Record<string, unknown>;
//# sourceMappingURL=json-schema.d.ts.map