import { NextResponse } from 'next/server';
import swaggerDefinition from '@/lib/swagger/swaggerConfig';

// Swagger JSON 생성
export async function GET() {
  const swaggerJson = {
    ...swaggerDefinition,
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['인증'],
          summary: '회원가입',
          description: '새로운 사용자를 등록합니다.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'email', 'password'],
                  properties: {
                    username: {
                      type: 'string',
                      minLength: 3,
                      maxLength: 20,
                      example: 'user123',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'user@example.com',
                    },
                    password: {
                      type: 'string',
                      minLength: 6,
                      example: 'password123',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: '회원가입 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            '400': {
              description: '잘못된 요청',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['인증'],
          summary: '로그인',
          description: '이메일/아이디와 비밀번호로 로그인합니다.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['identifier', 'password'],
                  properties: {
                    identifier: {
                      type: 'string',
                      description: '이메일 또는 사용자명',
                      example: 'user@example.com',
                    },
                    password: {
                      type: 'string',
                      example: 'password123',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: '로그인 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            '401': {
              description: '인증 실패',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          tags: ['인증'],
          summary: '로그아웃',
          description: '현재 사용자를 로그아웃합니다.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: '로그아웃 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['인증'],
          summary: '현재 사용자 정보 조회',
          description: '로그인한 사용자의 정보를 조회합니다.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: '사용자 정보',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            '401': {
              description: '인증되지 않음',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/blog/posts': {
        get: {
          tags: ['블로그'],
          summary: '블로그 포스트 목록 조회',
          description: '블로그 포스트 목록을 조회합니다. 검색 옵션을 지원합니다.',
          parameters: [
            {
              name: 'q',
              in: 'query',
              description: '검색어 (제목 또는 내용)',
              required: false,
              schema: {
                type: 'string',
              },
            },
            {
              name: 'limit',
              in: 'query',
              description: '결과 제한 (최대 100)',
              required: false,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: null,
              },
            },
          ],
          responses: {
            '200': {
              description: '블로그 포스트 목록',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      posts: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/BlogPost' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/blog/posts/{id}': {
        get: {
          tags: ['블로그'],
          summary: '블로그 포스트 상세 조회',
          description: '특정 블로그 포스트의 상세 정보를 조회합니다.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: '포스트 ID',
              schema: {
                type: 'integer',
              },
            },
          ],
          responses: {
            '200': {
              description: '블로그 포스트 상세',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      post: { $ref: '#/components/schemas/BlogPost' },
                    },
                  },
                },
              },
            },
            '404': {
              description: '포스트를 찾을 수 없음',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/analytics/track': {
        post: {
          tags: ['애널리틱스'],
          summary: '방문 추적',
          description: '사용자 방문 정보를 추적합니다.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['page_path', 'page_type'],
                  properties: {
                    page_path: {
                      type: 'string',
                      example: '/blog/1',
                    },
                    page_type: {
                      type: 'string',
                      enum: ['blog', 'page', 'service'],
                      example: 'blog',
                    },
                    referrer: {
                      type: 'string',
                      nullable: true,
                      example: 'https://google.com',
                    },
                    device_type: {
                      type: 'string',
                      enum: ['desktop', 'mobile', 'tablet'],
                      example: 'desktop',
                    },
                    service_name: {
                      type: 'string',
                      nullable: true,
                      example: 'MNPS',
                    },
                    duration: {
                      type: 'integer',
                      nullable: true,
                      description: '페이지 체류 시간 (초)',
                      example: 120,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: '추적 성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/admin/stats': {
        get: {
          tags: ['관리자'],
          summary: '관리자 통계 조회',
          description: '관리자 대시보드용 통계 정보를 조회합니다. 마스터 계정만 접근 가능합니다.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: '통계 정보',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      stats: {
                        type: 'object',
                        properties: {
                          totalUsers: { type: 'integer' },
                          todaySignups: { type: 'integer' },
                          weekSignups: { type: 'integer' },
                          totalBlogPosts: { type: 'integer' },
                          masterAccounts: { type: 'integer' },
                          systemStatus: {
                            type: 'object',
                            properties: {
                              server: { type: 'string' },
                              database: { type: 'string' },
                              diskSpace: { type: 'string' },
                            },
                          },
                        },
                      },
                      analytics: { $ref: '#/components/schemas/AnalyticsSummary' },
                    },
                  },
                },
              },
            },
            '401': {
              description: '인증되지 않음',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '403': {
              description: '권한 없음 (마스터 계정만 접근 가능)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/admin/analytics': {
        get: {
          tags: ['관리자'],
          summary: '관리자 애널리틱스 상세 조회',
          description: '관리자 대시보드용 상세 애널리틱스 정보를 조회합니다.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: '애널리틱스 상세 정보',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      stats: { type: 'object' },
                      analytics: { type: 'object' },
                      blogPosts: { type: 'array' },
                    },
                  },
                },
              },
            },
            '403': {
              description: '권한 없음',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  };

  return NextResponse.json(swaggerJson);
}

