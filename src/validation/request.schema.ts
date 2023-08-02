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
        mimeType: {
          type: 'string',
          enum: [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
          ]
        },
        url: {
          type: 'string'
        },
        connectionId: {
          type: 'number',
          minimum: 1,
        },
        fileURI: {
          type: 'string',
          minLength: 4
        }
      },
    },
  }
}

export const GetAndDeleteCloudConnectionSchema = {
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
    params: {
      type: 'object',
      properties: {
        connectionId: {
          type: 'number',
          minimum: 1
        }
      },
      required: ['connectionId'],
    }
  }
}

export const CreateCloudConnectionSchema = {
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
        provider: {
          type: 'string',
          enum: ['AWS', 'GCP', 'AZURE', 'SCALOR']
        },
        bucket: {
          type: 'string',
          minLength: 3,
          maxLength: 255,
        },
        region: {
          type: 'string'
        },
        accessKey: {
          type: 'string'
        },
        secretKey: {
          type: 'string'
        },
        accountName: {
          type: 'string'
        },
        accountAccessKey: {
          type: 'string'
        }
      },
      required: ['provider'],
    }
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
        url: {
          type: 'string'
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
        url: {
          type: 'string'
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
        url: {
          type: 'string'
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
        url: {
          type: 'string'
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
        url: {
          type: 'string'
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
        urlOne: {
          type: 'string'
        },
        idTwo: {
          type: 'string',
          minLength: 36,
          maxLength: 36
        },
        urlTwo: {
          type: 'string'
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


export const EncodeSchema = {
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
        connectionId: {
          type: 'number',
        },
        url: {
          type: 'string'
        },
        fileURI: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        },
        webhookURL: {
          type: 'string',
          minLength: 8,
          maxLength: 120
        },
        format: {
          type: 'string',
          enum: ['1080', '720', '540', '360']
        },
        mimeType: {
          type: 'string',
          minLength: 8,
          maxLength: 12
        }
      },
      required: ['connectionId', 'url', 'fileURI', 'webhookURL', 'format', 'mimeType'],
    }
  }
}