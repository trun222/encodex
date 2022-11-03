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
      },
    },
    required: ['email']
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
        platform: {
          type: 'string',
          enum: ["WEB", "SERVER"]
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['height', 'width', 'platform', 'mimeType'],
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
        platform: {
          type: 'string',
          enum: ["WEB", "SERVER"]
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['quality', 'platform', 'mimeType'],
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
        platform: {
          type: 'string',
          enum: ["WEB", "SERVER"]
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['moonValue', 'platform', 'mimeType'],
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
        platform: {
          type: 'string',
          enum: ["WEB", "SERVER"]
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['sharpenValue', 'platform', 'mimeType'],
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
        platform: {
          type: 'string',
          enum: ["WEB", "SERVER"]
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['platform', 'mimeType'],
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
        platform: {
          type: 'string',
          enum: ["WEB", "SERVER"]
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['platform', 'mimeType'],
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