export const ResizeSchema = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
        },
        token: {
          type: 'string',
        },
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        file: {
          contentMediaType: 'multipart/form-data',
          contentEncoding: '7bit',
        },
        height: {
          type: 'number',
          maximum: 10_000,
          minimum: 1,
        },
        width: {
          type: 'number',
          maximum: 10_000,
          minimum: 1,
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        }
      },
      required: ['file', 'height', 'width', 'outputFileName'],
    }
  }
}