const token = {
  type: 'string',
  minLength: 36,
  maxLength: 36,
};

export const SignupSchema = {
  schema: {
    body: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email'
        },
        contact: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50
            },
            address: {
              type: 'string',
              minLength: 4,
              maxLength: 50
            },
            city: {
              type: 'string',
              minLength: 4,
              maxLength: 50
            },
            state: {
              type: 'string',
              minLength: 2,
              maxLength: 2
            },
            zip: {
              type: 'string',
              minLength: 5,
              maxLength: 5
            }
          },
          required: ['firstName', 'lastName', 'address', 'city', 'state', 'zip']
        },
      },
      required: ['email', 'contact']
    },
  }
}

export const UploadSchema = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
        },
        token,
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
      },
      required: ['file'],
    },
  }
}

export const ResizeSchema = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
        },
        token,
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36
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
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['id', 'height', 'width', 'outputFileName', 'mimeType'],
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
        token
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36
        },
        quality: {
          type: 'number',
          minimum: 1,
          maximum: 100,
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['id', 'quality', 'outputFileName', 'mimeType'],
    }
  }
}

export const MoonlightSchema = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
        },
        token
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36
        },
        moonValue: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['id', 'moonValue', 'outputFileName', 'mimeType'],
    }
  }
}

export const SharpenSchema = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
        },
        token
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36
        },
        sharpenValue: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['id', 'sharpenValue', 'outputFileName', 'mimeType'],
    }
  }
}

export const NoExtraParamsSchema = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
        },
        token
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minLength: 36,
          maxLength: 36
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['id', 'outputFileName', 'mimeType'],
    }
  }
}

export const CollageSchema = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        'Content-Type': {
          type: 'string',
        },
        token
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        idOne: {
          type: 'string',
          minLength: 36,
          maxLength: 36
        },
        idTwo: {
          type: 'string',
          minLength: 36,
          maxLength: 36
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['idOne', 'idTwo', 'outputFileName', 'mimeType'],
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
        token
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
          enum: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
        },
        outputFileName: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        }
      },
      required: ['format', 'outputFileName'],
    }
  }
}