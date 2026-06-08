/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};

export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 120,
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "faviconUrl",
      type: "url",
      required: false,
      label: "Favicon URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        { fieldName: "primary", type: "color", required: true, label: "Primary (Navy)" },
        { fieldName: "secondary", type: "color", required: true, label: "Secondary (Slate)" },
        { fieldName: "accent", type: "color", required: true, label: "Accent (Amber)" },
      ],
    },
    {
      fieldName: "heroHeading",
      type: "string",
      required: false,
      label: "Hero Heading",
      maxLength: 80,
    },
    {
      fieldName: "heroSubheading",
      type: "string",
      required: false,
      label: "Hero Subheading",
      maxLength: 200,
    },
    {
      fieldName: "heroCta",
      type: "string",
      required: false,
      label: "Hero CTA Button Label",
      maxLength: 40,
    },
    {
      fieldName: "features",
      type: "array",
      label: "Feature List",
      item: {
        type: "object",
        fields: [
          { fieldName: "title", type: "string", required: true, label: "Title" },
          { fieldName: "description", type: "string", required: true, label: "Description" },
          { fieldName: "icon", type: "string", required: false, label: "Icon Name (lucide)" },
        ],
      },
    },
    {
      fieldName: "pricingPlans",
      type: "array",
      label: "Pricing Plans",
      item: {
        type: "object",
        fields: [
          { fieldName: "name", type: "string", required: true, label: "Plan Name" },
          { fieldName: "price", type: "string", required: true, label: "Price (e.g. Free, $19/mo)" },
          { fieldName: "description", type: "string", required: false, label: "Description" },
          { fieldName: "highlighted", type: "boolean", required: false, label: "Highlight (recommended)" },
          {
            fieldName: "features",
            type: "array",
            label: "Included Features",
            item: { type: "string", required: true },
          },
        ],
      },
    },
    {
      fieldName: "uploadSectionHeading",
      type: "string",
      required: false,
      label: "Upload Section Heading",
      maxLength: 80,
    },
    {
      fieldName: "uploadHint",
      type: "string",
      required: false,
      label: "Upload Zone Hint Text",
      maxLength: 120,
    },
    {
      fieldName: "dashboardHeading",
      type: "string",
      required: false,
      label: "Dashboard Heading",
      maxLength: 80,
    },
    {
      fieldName: "footerText",
      type: "string",
      required: false,
      label: "Footer Text",
      maxLength: 200,
    },
    {
      fieldName: "showPricing",
      type: "boolean",
      required: false,
      label: "Show Pricing Section on Landing",
    },
    {
      fieldName: "showFeatures",
      type: "boolean",
      required: false,
      label: "Show Features Section on Landing",
    },
    {
      fieldName: "privacyStatement",
      type: "string",
      required: false,
      label: "Privacy Statement (short)",
      maxLength: 160,
    },
  ],
};
