/**
 * Swagger/OpenAPI 설정
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'KPSY LAB API',
    version: '1.0.0',
    description: 'KPSY LAB 통합 플랫폼 API 문서',
    contact: {
      name: 'KPSY LAB',
      url: 'https://www.kpsylab.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:7777',
      description: '개발 서버',
    },
    {
      url: 'https://www.kpsylab.com',
      description: '프로덕션 서버',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: '에러 메시지',
          },
        },
      },
      BlogPost: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          title: {
            type: 'string',
            example: '블로그 포스트 제목',
          },
          content: {
            type: 'string',
            example: '블로그 포스트 내용 (HTML)',
          },
          author: {
            type: 'string',
            example: '작성자',
          },
          date: {
            type: 'string',
            format: 'date',
            example: '2026-01-06',
          },
          tags: {
            type: 'string',
            example: '태그1, 태그2',
          },
          image: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/image.jpg',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          username: {
            type: 'string',
            example: 'username',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          role: {
            type: 'string',
            enum: ['user', 'master'],
            example: 'user',
          },
        },
      },
      AnalyticsSummary: {
        type: 'object',
        properties: {
          totalVisits: {
            type: 'integer',
            example: 1000,
          },
          uniqueVisitorsTotal: {
            type: 'integer',
            example: 500,
          },
          todayVisits: {
            type: 'integer',
            example: 50,
          },
          uniqueVisitorsToday: {
            type: 'integer',
            example: 30,
          },
        },
      },
    },
  },
  tags: [
    {
      name: '인증',
      description: '사용자 인증 관련 API',
    },
    {
      name: '블로그',
      description: '블로그 포스트 관련 API',
    },
    {
      name: '애널리틱스',
      description: '방문 통계 및 분석 API',
    },
    {
      name: '관리자',
      description: '관리자 전용 API',
    },
  ],
};

export default swaggerDefinition;

