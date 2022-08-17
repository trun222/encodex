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

export const ThumbnailSchema = {
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


export const ReduceSchema = {
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
        percentage: {
          type: 'string',
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        }
      },
      required: ['file', 'percentage', 'outputFileName'],
    }
  }
}

export const QualitySchema = {
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
        quality: {
          type: 'number',
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        }
      },
      required: ['file', 'quality', 'outputFileName'],
    }
  }
}

export const FormatSchema = {
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
        format: {
          type: 'string',
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        }
      },
      required: ['file', 'format', 'outputFileName'],
    }
  }
}